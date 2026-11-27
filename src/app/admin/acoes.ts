"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import { podeExcluir, statusPermitidos } from "@/lib/regras-pedido";
import { registrarEventoSemQuebrar } from "@/lib/eventos-do-pedido";

// Ações do painel. Rodam no servidor, e cada uma confere de novo quem está
// pedindo: o navegador não decide quem é administradora.
async function exigirAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario || !ehAdmin(usuario.email)) {
    throw new Error("Sem permissão.");
  }
  // Devolve quem foi, para o histórico do pedido dizer de quem partiu a
  // mudança em vez de só "alguém".
  return usuario.email ?? "painel";
}

const STATUS_PERMITIDOS = [
  "AWAITING_CONTACT",
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type Status = (typeof STATUS_PERMITIDOS)[number];

export async function mudarStatusDoPedido(id: string, status: string) {
  const quem = await exigirAdmin();

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
    throw new Error("Pedido pago não volta para uma situação de não pago.");
  }

  await prisma.order.update({
    where: { id },
    data: { status: status as Status },
  });

  await registrarEventoSemQuebrar(id, status as Status, quem);

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
      'Pedido pago não pode ser excluído. Use "Cancelado" se a venda não foi adiante.',
    );
  }

  await prisma.order.delete({ where: { id } });

  revalidatePath("/admin");
}

// Guarda o rastreio que a loja colar.
//
// Aceita das duas formas: o código solto dos Correios (DG048745602BR) ou o
// link que a SuperFrete devolve quando a etiqueta é postada. Obrigar um
// formato só faria a loja ter que extrair o código de dentro do link à mão,
// que é trabalho sem motivo.
export async function salvarRastreio(id: string, valor: string) {
  await exigirAdmin();

  const limpo = valor.trim();
  if (limpo.length > 500) {
    throw new Error("Rastreio longo demais.");
  }

  await prisma.order.update({
    where: { id },
    data: { tracking: limpo || null },
  });

  revalidatePath("/admin");
}
