// Regras do pedido que valem nos dois lados: na tela e no servidor.
//
// Este arquivo não importa nada de servidor de propósito. A tela precisa das
// mesmas regras para não oferecer o que vai ser recusado, e qualquer import de
// next/headers aqui arrastaria código de servidor para dentro do navegador.

export type PedidoProtegido = { paymentStatus: string };

// Horas que um pedido fica esperando o pagamento antes de ser considerado
// desistência. O link do Pix da InfinitePay vence bem antes disso.
export const HORAS_ATE_EXPIRAR = 24;

export function pedidoFoiPago(pedido: PedidoProtegido) {
  return pedido.paymentStatus === "PAID";
}

// Depois que o dinheiro entra, o pedido deixa de ser rascunho e vira registro
// de venda: não se apaga.
export function podeExcluir(pedido: PedidoProtegido) {
  return !pedidoFoiPago(pedido);
}

// Em pedido pago, somem as situações que o fariam parecer não pago.
// "Cancelado" continua disponível: estorno acontece, e é melhor registrar do
// que deixar a loja sem saída.
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

export function pedidoExpirou(pedido: { status: string; createdAt: Date }) {
  if (pedido.status !== "AWAITING_PAYMENT") return false;
  const horas = (Date.now() - pedido.createdAt.getTime()) / (1000 * 60 * 60);
  return horas > HORAS_ATE_EXPIRAR;
}

// Carrinho que foi até o pagamento e não voltou some do histórico da cliente,
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
