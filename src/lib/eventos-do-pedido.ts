import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

// Registra cada passo do pedido com a hora em que deu.
//
// É isto que permite a trilha da cliente ter data, e o painel ter histórico.
// Sem registro, o pedido só sabe dizer onde está agora, nunca desde quando.

export async function registrarEvento(
  orderId: string,
  status: OrderStatus,
  origem: string,
) {
  // Não repete o mesmo passo duas vezes seguidas. Acontece quando a página da
  // cliente e o aviso da InfinitePay chegam juntos, ou quando alguém salva a
  // mesma situação de novo no painel sem querer: o histórico viraria uma
  // lista de linhas iguais e perderia a serventia.
  const ultimo = await prisma.orderEvent.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });

  if (ultimo?.status === status) return;

  await prisma.orderEvent.create({ data: { orderId, status, origem } });
}

// Nunca derruba quem chamou: o histórico é registro, e perder uma linha dele
// não pode impedir um pedido de ser pago ou despachado.
export function registrarEventoSemQuebrar(
  orderId: string,
  status: OrderStatus,
  origem: string,
) {
  return registrarEvento(orderId, status, origem).catch((erro) => {
    console.error(`[evento] não deu para registrar ${status}:`, erro);
  });
}

export type EventoDoPedido = { status: OrderStatus; createdAt: Date };

// Quando cada situação aconteceu pela primeira vez.
//
// Pela PRIMEIRA, de propósito: se um pedido voltar para uma situação anterior
// e avançar de novo, a data que interessa à cliente é a de quando aquilo
// aconteceu, não a da correção.
export function primeiraVezEm(eventos: EventoDoPedido[]) {
  const quando = new Map<OrderStatus, Date>();
  for (const evento of [...eventos].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )) {
    if (!quando.has(evento.status)) quando.set(evento.status, evento.createdAt);
  }
  return quando;
}
