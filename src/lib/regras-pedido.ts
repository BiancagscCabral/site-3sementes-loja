// Regras do pedido que valem nos dois lados: na tela e no servidor.
//
// Este arquivo não importa nada de servidor de propósito. A tela precisa das
// mesmas regras para não oferecer o que vai ser recusado, e qualquer import de
// next/headers aqui arrastaria código de servidor para dentro do navegador.

export type PedidoProtegido = { paymentStatus: string };

// Horas que um pedido fica esperando o pagamento antes de sumir das telas.
//
// Carrinho que chegou no pagamento e não voltou é desistência na prática, e
// acumulado ele esconde o pedido que importa no meio do que não serve.
//
// Expirar NÃO apaga nada: o pedido continua no banco. Se a cliente pagar
// depois das duas horas, o aviso da InfinitePay ainda acha o pedido, ele vira
// pago e reaparece sozinho. Apagar quebraria justamente a venda atrasada.
export const HORAS_ATE_EXPIRAR = 2;

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
      "IN_PRODUCTION",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
  }
  return ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"];
}

export function pedidoExpirou(pedido: { status: string; createdAt: Date }) {
  if (pedido.status !== "AWAITING_PAYMENT") return false;
  const horas = (Date.now() - pedido.createdAt.getTime()) / (1000 * 60 * 60);
  return horas > HORAS_ATE_EXPIRAR;
}

// Carrinho que foi até o pagamento e não voltou some do histórico da cliente
// e também do painel, mas continua no banco.
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

// Cancelamento pedido pela cliente.
//
// A régua é o dinheiro e o trabalho já gastos:
//
// - Ainda não pagou: desistir não custa nada a ninguém. Cancela na hora.
// - Já pagou: cancelar significa devolver dinheiro, e isso é decisão da loja,
//   não do site. A cliente pede, a loja resolve.
// - Já foi postado: não é mais cancelamento, é devolução, e passa por
//   conversa.
export type PedidoParaCancelar = { status: string; paymentStatus: string };

export function clientePodeCancelarDireto(pedido: PedidoParaCancelar) {
  return (
    pedido.paymentStatus !== "PAID" &&
    (pedido.status === "AWAITING_PAYMENT" ||
      pedido.status === "AWAITING_CONTACT")
  );
}

export function clientePodePedirCancelamento(pedido: PedidoParaCancelar) {
  if (clientePodeCancelarDireto(pedido)) return false;
  // Depois de postado não há o que cancelar: a encomenda está com o correio.
  return ["AWAITING_PAYMENT", "PAID", "IN_PRODUCTION"].includes(pedido.status);
}
