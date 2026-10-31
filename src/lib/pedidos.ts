import { prisma } from "@/lib/prisma";
import { priceForSize } from "@/lib/catalog";
import { usuarioAtual } from "@/lib/supabase/servidor";

export type ItemRecebido = {
  slug: string;
  quantidade: number;
  tamanho?: string | null;
  variacao?: string | null;
};

export type CorpoDoPedido = {
  cliente?: { nome?: string; telefone?: string; email?: string };
  endereco?: Record<string, string>;
  entrega?: { metodo?: string; servico?: string; precoCents?: number | null };
  itens?: ItemRecebido[];
};

export class ErroDePedido extends Error {}

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0 e 1

function gerarCodigo() {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `3S-${codigo}`;
}

async function codigoInedito() {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigo();
    const existe = await prisma.order.findUnique({ where: { code: codigo } });
    if (!existe) return codigo;
  }
  throw new ErroDePedido("não consegui gerar um código de pedido");
}

// Monta e grava o pedido. Os preços são lidos do banco: o navegador só informa
// o que foi escolhido, nunca quanto custa.
export async function criarPedido(
  corpo: CorpoDoPedido,
  status: "AWAITING_CONTACT" | "AWAITING_PAYMENT",
) {
  const nome = String(corpo.cliente?.nome ?? "").trim();
  const telefone = String(corpo.cliente?.telefone ?? "").trim();
  const itens = Array.isArray(corpo.itens) ? corpo.itens : [];

  if (!nome || !telefone || itens.length === 0) {
    throw new ErroDePedido("Dados incompletos.");
  }

  const produtos = await prisma.product.findMany({
    where: { slug: { in: itens.map((item) => String(item.slug)) } },
    select: { id: true, slug: true, name: true, priceCents: true },
  });

  const linhas = [];
  for (const item of itens) {
    const produto = produtos.find((p) => p.slug === item.slug);
    if (!produto) continue;

    const quantidade = Math.min(Math.max(Number(item.quantidade) || 1, 1), 50);
    const tamanho = item.tamanho ? String(item.tamanho) : null;

    linhas.push({
      productId: produto.id,
      productName: produto.name,
      variantName: item.variacao ? String(item.variacao) : null,
      size: tamanho,
      quantity: quantidade,
      unitPriceCents: priceForSize(produto.priceCents, tamanho),
    });
  }

  if (linhas.length === 0) throw new ErroDePedido("Produtos não encontrados.");

  const produtosCents = linhas.reduce(
    (total, linha) => total + linha.unitPriceCents * linha.quantity,
    0,
  );
  const freteCents =
    typeof corpo.entrega?.precoCents === "number"
      ? Math.max(0, Math.round(corpo.entrega.precoCents))
      : null;

  // A conta vem da sessão no servidor, nunca do que o navegador mandou.
  const usuario = await usuarioAtual();

  return prisma.order.create({
    data: {
      code: await codigoInedito(),
      customerUserId: usuario?.id ?? null,
      customerName: nome,
      customerPhone: telefone,
      customerEmail: corpo.cliente?.email?.trim() || usuario?.email || null,
      shippingAddress: corpo.endereco ?? {},
      deliveryMethod: corpo.entrega?.metodo ?? null,
      shippingService: corpo.entrega?.servico ?? null,
      shippingCents: freteCents,
      totalCents: produtosCents + (freteCents ?? 0),
      status,
      items: { create: linhas },
    },
    include: { items: true },
  });
}

// Horas que um pedido fica esperando o pagamento antes de ser considerado
// desistência. O link do Pix da InfinitePay vence bem antes disso.
const HORAS_ATE_EXPIRAR = 24;

// Carrinho que foi até o pagamento e não voltou. Some do histórico da cliente,
// mas continua no banco e visível no painel: é dado de venda perdida.
//
// Cuidado deliberado: isto NÃO alcança os pedidos de WhatsApp
// (AWAITING_CONTACT). Eles nunca constam como pagos aqui, porque o pagamento
// acontece na conversa — expirá-los apagaria o canal que mais vende.
export function filtroDePedidosDaCliente() {
  const limite = new Date(Date.now() - HORAS_ATE_EXPIRAR * 60 * 60 * 1000);
  return {
    NOT: {
      AND: [{ status: "AWAITING_PAYMENT" as const }, { createdAt: { lt: limite } }],
    },
  };
}

export function pedidoExpirou(pedido: { status: string; createdAt: Date }) {
  if (pedido.status !== "AWAITING_PAYMENT") return false;
  const horas = (Date.now() - pedido.createdAt.getTime()) / (1000 * 60 * 60);
  return horas > HORAS_ATE_EXPIRAR;
}

// Regras de proteção do pedido pago.
//
// Depois que o dinheiro entra, o pedido deixa de ser rascunho e passa a ser
// registro de venda. O que ele ainda precisa é andar — pago, postado,
// finalizado. O que ele não pode é ser apagado nem voltar a parecer que nunca
// foi pago.
export type PedidoProtegido = { paymentStatus: string };

export function pedidoFoiPago(pedido: PedidoProtegido) {
  return pedido.paymentStatus === "PAID";
}

export function podeExcluir(pedido: PedidoProtegido) {
  return !pedidoFoiPago(pedido);
}

// Em pedido pago, sumem as situações que o fariam parecer não pago.
// "Cancelado" continua disponível: estorno acontece, e é melhor registrar do
// que deixar você sem saída.
export function statusPermitidos(pedido: PedidoProtegido) {
  if (!pedidoFoiPago(pedido)) {
    return [
      "AWAITING_CONTACT",
      "AWAITING_PAYMENT",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
  }
  return ["PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
}
