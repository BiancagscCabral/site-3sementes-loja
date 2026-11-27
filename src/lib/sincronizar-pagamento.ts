import { prisma } from "@/lib/prisma";
import { conferirPagamento, pagamentoConfigurado } from "@/lib/infinitepay";
import { enderecosDaLoja, enviarEmailSemEsperar } from "@/lib/email";
import { registrarEventoSemQuebrar } from "@/lib/eventos-do-pedido";
import {
  emailPagamentoAprovadoParaLoja,
  emailPagamentoConfirmado,
} from "@/lib/emails-do-pedido";

// Pergunta à InfinitePay se o pedido foi pago e grava a resposta.
//
// Por que não basta o webhook: a InfinitePay avisa uma vez quando o pagamento
// entra, e não promete nada além disso. Não há retentativa documentada nem
// garantia de entrega. Um aviso perdido deixaria a venda parada como "não
// paga" para sempre, com o dinheiro já na conta e ninguém sabendo.
//
// Então o webhook virou atalho, não dependência: ele chama isto aqui, e as
// telas chamam também. Quem decide é sempre a consulta de volta à
// InfinitePay, nunca o aviso, que chega sem assinatura e poderia ser forjado.

// Depois de um tempo, um pedido não pago é carrinho abandonado, e perguntar
// por ele a cada visita só gasta chamada à toa.
const HORAS_PARA_INSISTIR = 48;

// Guarda quando cada pedido foi consultado pela última vez. A página da
// cliente recarrega de poucos em poucos segundos enquanto ela espera, e sem
// isto cada recarga viraria uma chamada à InfinitePay.
//
// Vive na memória do processo, então em servidor que escala para várias
// instâncias ele não enxerga as consultas das outras. Não tem problema: o
// pior caso é consultar mais vezes do que o necessário, e consultar não muda
// nada nem gasta dinheiro.
const ULTIMA_CONSULTA = new Map<string, number>();
const SEGUNDOS_ENTRE_CONSULTAS = 5;

type Resultado =
  | { mudou: false; motivo: string }
  | { mudou: true; valorConfere: boolean };

export async function sincronizarPagamento(
  code: string,
  pistas?: { transactionNsu?: string; slug?: string },
): Promise<Resultado> {
  if (!pagamentoConfigurado()) {
    return { mudou: false, motivo: "pagamento não configurado" };
  }

  const pedido = await prisma.order.findUnique({ where: { code } });
  if (!pedido) return { mudou: false, motivo: "pedido não existe" };
  if (pedido.paymentStatus === "PAID") {
    return { mudou: false, motivo: "já estava pago" };
  }

  // Pedido de WhatsApp não tem pagamento online para consultar.
  if (pedido.status !== "AWAITING_PAYMENT") {
    return { mudou: false, motivo: "não é pedido de pagamento online" };
  }

  const horas = (Date.now() - pedido.createdAt.getTime()) / (1000 * 60 * 60);
  if (horas > HORAS_PARA_INSISTIR) {
    return { mudou: false, motivo: "pedido velho demais" };
  }

  // O webhook sempre consulta: ele chega justamente porque algo mudou.
  const veioDoWebhook = Boolean(pistas);
  if (!veioDoWebhook) {
    const ultima = ULTIMA_CONSULTA.get(code) ?? 0;
    if (Date.now() - ultima < SEGUNDOS_ENTRE_CONSULTAS * 1000) {
      return { mudou: false, motivo: "consultado agora há pouco" };
    }
  }
  ULTIMA_CONSULTA.set(code, Date.now());

  const confirmacao = await conferirPagamento({
    orderNsu: code,
    transactionNsu: pistas?.transactionNsu,
    slug: pistas?.slug,
  });

  if (!confirmacao.pago) return { mudou: false, motivo: "ainda não pago" };

  // Pagou menos do que o pedido vale? Registra como pago mas não despacha:
  // fica para conferência manual no painel.
  const valorPago = confirmacao.valorPagoCents;
  const valorConfere = valorPago == null || valorPago >= pedido.totalCents;

  // O updateMany com paymentStatus PENDING no filtro é a trava contra aviso e
  // página chegando ao mesmo tempo: só um dos dois encontra o pedido ainda
  // pendente, e só esse manda e-mail. Sem isso a cliente receberia duplicado.
  const { count } = await prisma.order.updateMany({
    where: { id: pedido.id, paymentStatus: "PENDING" },
    data: {
      paymentStatus: "PAID",
      status: valorConfere ? "PAID" : "AWAITING_PAYMENT",
      paidAmountCents: valorPago,
      paymentMethod: confirmacao.meio,
      infinitePaySlug: pistas?.slug ?? pedido.infinitePaySlug,
      infinitePayOrderNsu: code,
    },
  });

  if (count === 0) {
    return { mudou: false, motivo: "outro caminho gravou primeiro" };
  }

  if (!valorConfere) {
    console.warn(
      `[pagamento] pedido ${code}: pago ${valorPago} de ${pedido.totalCents}`,
    );
  }

  void registrarEventoSemQuebrar(
    pedido.id,
    valorConfere ? "PAID" : "AWAITING_PAYMENT",
    "sistema",
  );

  await avisarDoPagamento(pedido, valorPago, confirmacao.meio, valorConfere);

  return { mudou: true, valorConfere };
}

async function avisarDoPagamento(
  pedido: {
    id: string;
    code: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    totalCents: number;
    shippingCents: number | null;
    shippingService: string | null;
  },
  valorPago: number | null | undefined,
  meio: string | null | undefined,
  valorConfere: boolean,
) {
  const itens = await prisma.orderItem.findMany({
    where: { orderId: pedido.id },
    select: {
      productName: true,
      variantName: true,
      size: true,
      quantity: true,
      unitPriceCents: true,
    },
  });

  const resumo = {
    code: pedido.code,
    customerName: pedido.customerName,
    totalCents: pedido.totalCents,
    shippingCents: pedido.shippingCents,
    shippingService: pedido.shippingService,
    items: itens,
  };

  // A cliente só é avisada quando o valor fecha: dizer "pagamento confirmado"
  // para quem pagou a menos criaria uma expectativa errada.
  if (valorConfere && pedido.customerEmail) {
    const { assunto, html } = emailPagamentoConfirmado(resumo);
    enviarEmailSemEsperar({ para: pedido.customerEmail, assunto, html });
  }

  // A loja é avisada nos dois casos. Quando o valor não fecha, o aviso vai
  // justamente para pedir conferência: é o caso em que ficar sem saber dói
  // mais, porque o pedido fica parado esperando alguém olhar.
  const aviso = emailPagamentoAprovadoParaLoja({
    ...resumo,
    customerPhone: pedido.customerPhone,
    customerEmail: pedido.customerEmail,
    valorPagoCents: valorPago ?? null,
    meioDePagamento: meio ?? null,
    valorConfere,
  });

  for (const endereco of enderecosDaLoja()) {
    enviarEmailSemEsperar({
      para: endereco,
      assunto: aviso.assunto,
      html: aviso.html,
      responderPara: pedido.customerEmail ?? undefined,
    });
  }
}
