"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import { podeExcluir, statusPermitidos } from "@/lib/pedidos";

// Ações do painel. Rodam no servidor, e cada uma confere de novo quem está
// pedindo: o navegador não decide quem é administradora.
async function exigirAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario || !ehAdmin(usuario.email)) {
    throw new Error("Sem permissão.");
  }
}

const STATUS_PERMITIDOS = [
  "AWAITING_CONTACT",
  "AWAITING_PAYMENT",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type Status = (typeof STATUS_PERMITIDOS)[number];

export async function mudarStatusDoPedido(id: string, status: string) {
  await exigirAdmin();

  if (!STATUS_PERMITIDOS.includes(status as Status)) {
    throw new Error("Status inválido.");
  }

  const pedido = await prisma.order.findUnique({
    where: { id },
    select: { paymentStatus: true },
  });
  if (!pedido) throw new Error("Pedido não encontrado.");

  // A tela já esconde o que não pode, mas quem decide é o servidor: botão
  // escondido continua sendo só um botão escondido.
  if (!statusPermitidos(pedido).includes(status)) {
    throw new Error(
      "Pedido pago não volta para uma situação de não pago.",
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: status as Status },
  });

  revalidatePath("/admin");
}

// Apaga de vez: o pedido e os itens dele. Serve para limpar carrinho
// abandonado e pedido falso. Pedido pago não deveria passar por aqui — é
// registro de venda —, por isso a tela avisa antes.
export async function excluirPedido(id: string) {
  await exigirAdmin();

  const pedido = await prisma.order.findUnique({
    where: { id },
    select: { paymentStatus: true },
  });
  if (!pedido) throw new Error("Pedido não encontrado.");

  if (!podeExcluir(pedido)) {
    throw new Error(
      "Pedido pago não pode ser excluído. Use \"Cancelado\" se a venda não foi adiante.",
    );
  }

  await prisma.order.delete({ where: { id } });

  revalidatePath("/admin");
}
