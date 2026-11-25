import { prisma } from "@/lib/prisma";
import { priceForSize } from "@/lib/catalog";
import { usuarioAtual } from "@/lib/supabase/servidor";
import { enviarEmailSemEsperar } from "@/lib/email";
import { emailPedidoRecebido } from "@/lib/emails-do-pedido";

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

  const pedido = await prisma.order.create({
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

  avisarDoPedidoNovo(pedido);

  return pedido;
}

// Avisa a cliente e a loja. Sem esperar resposta de propósito: o pedido já
// está gravado, e ninguém deveria olhar para uma tela de carregamento porque
// o servidor de e-mail está lento.
function avisarDoPedidoNovo(
  pedido: Awaited<ReturnType<typeof prisma.order.create>> & {
    items: { productName: string; variantName: string | null; size: string | null; quantity: number; unitPriceCents: number }[];
  },
) {
  const dados = {
    code: pedido.code,
    customerName: pedido.customerName,
    totalCents: pedido.totalCents,
    shippingCents: pedido.shippingCents,
    shippingService: pedido.shippingService,
    items: pedido.items,
  };

  if (pedido.customerEmail) {
    const { assunto, html } = emailPedidoRecebido(dados);
    enviarEmailSemEsperar({ para: pedido.customerEmail, assunto, html });
  }

  // A loja NÃO é avisada aqui, de propósito. Pedido feito é intenção, e a
  // maioria não vira venda: avisar aqui encheria a caixa de entrada de
  // carrinho abandonado e faria o aviso que importa se perder no meio.
  //
  // O aviso da loja sai quando o pagamento entra, no webhook da InfinitePay.
  // No caminho do WhatsApp não sai e-mail nenhum porque a própria cliente
  // manda o pedido inteiro na conversa: seria aviso em duplicata.
}

export {
  filtroDePedidosDaCliente,
  pedidoExpirou,
  pedidoFoiPago,
  podeExcluir,
  statusPermitidos,
} from "@/lib/regras-pedido";
