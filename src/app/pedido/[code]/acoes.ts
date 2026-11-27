"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  clientePodeCancelarDireto,
  clientePodePedirCancelamento,
} from "@/lib/regras-pedido";
import { registrarEventoSemQuebrar } from "@/lib/eventos-do-pedido";
import { enderecosDaLoja, enviarEmailSemEsperar } from "@/lib/email";
import { emailPedidoDeCancelamento } from "@/lib/emails-do-pedido";

// Cancelamento pela cliente, na página do pedido.
//
// Quem autoriza é o código do pedido: ele tem seis caracteres sorteados de um
// alfabeto de 32, o que dá mais de um bilhão de combinações, e só chega a quem
// fez a compra. Não dá para varrer códigos alheios na tentativa.
//
// As regras de quando cabe cancelar estão em lib/regras-pedido, usadas aqui e
// na tela: a tela esconde o que não cabe, e aqui confere de novo, porque botão
// escondido continua sendo só um botão escondido.

type Resultado = { ok: true; mensagem: string } | { ok: false; erro: string };

export async function cancelarPedidoPelaCliente(
  code: string,
): Promise<Resultado> {
  const pedido = await prisma.order.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!pedido) return { ok: false, erro: "Pedido não encontrado." };

  if (!clientePodeCancelarDireto(pedido)) {
    return {
      ok: false,
      erro: "Este pedido não pode mais ser cancelado por aqui. Chame a gente no WhatsApp.",
    };
  }

  await prisma.order.update({
    where: { id: pedido.id },
    data: { status: "CANCELLED" },
  });

  await registrarEventoSemQuebrar(pedido.id, "CANCELLED", "cliente");

  revalidatePath(`/pedido/${pedido.code}`);
  revalidatePath("/admin");
  revalidatePath("/minha-conta");

  return {
    ok: true,
    mensagem: "Pedido cancelado. Se mudar de ideia, é só fazer outro.",
  };
}

// Pedido PAGO não é cancelado pelo site: cancelar aqui significaria devolver
// dinheiro, e quem decide isso é a loja. A cliente avisa, a loja resolve.
export async function pedirCancelamento(
  code: string,
  motivo: string,
): Promise<Resultado> {
  const pedido = await prisma.order.findUnique({
    where: { code: code.toUpperCase() },
    include: { items: true },
  });
  if (!pedido) return { ok: false, erro: "Pedido não encontrado." };

  if (!clientePodePedirCancelamento(pedido)) {
    return {
      ok: false,
      erro: "Este pedido já foi postado. Chame a gente no WhatsApp para resolver.",
    };
  }

  const aviso = emailPedidoDeCancelamento({
    code: pedido.code,
    customerName: pedido.customerName,
    customerPhone: pedido.customerPhone,
    customerEmail: pedido.customerEmail,
    totalCents: pedido.totalCents,
    shippingCents: pedido.shippingCents,
    shippingService: pedido.shippingService,
    items: pedido.items,
    motivo: motivo.trim().slice(0, 500),
    jaPago: pedido.paymentStatus === "PAID",
  });

  for (const endereco of enderecosDaLoja()) {
    enviarEmailSemEsperar({
      para: endereco,
      assunto: aviso.assunto,
      html: aviso.html,
      responderPara: pedido.customerEmail ?? undefined,
    });
  }

  return {
    ok: true,
    mensagem:
      "Avisamos a loja. Ela entra em contato com você pelo WhatsApp para resolver.",
  };
}
