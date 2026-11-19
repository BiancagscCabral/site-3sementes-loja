import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { conferirPagamento } from "@/lib/infinitepay";
import { enviarEmailSemEsperar } from "@/lib/email";
import { emailPagamentoConfirmado } from "@/lib/emails-do-pedido";

// Aviso de pagamento da InfinitePay.
//
// O aviso não vem assinado, então ele serve apenas como "vá conferir o pedido
// tal". Quem decide se o pedido foi pago é a consulta de volta à InfinitePay.
export async function POST(request: Request) {
  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const orderNsu = String(corpo.order_nsu ?? "").trim();
  if (!orderNsu) {
    return NextResponse.json({ erro: "sem order_nsu" }, { status: 400 });
  }

  const pedido = await prisma.order.findUnique({ where: { code: orderNsu } });
  if (!pedido) {
    // Pedido que não é nosso: respondemos 200 para a InfinitePay não ficar
    // reenviando para sempre um aviso que nunca vai servir.
    console.warn("[infinitepay] aviso para pedido inexistente:", orderNsu);
    return NextResponse.json({ ok: true });
  }

  if (pedido.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true }); // aviso repetido
  }

  try {
    const confirmacao = await conferirPagamento({
      orderNsu,
      transactionNsu: corpo.transaction_nsu
        ? String(corpo.transaction_nsu)
        : undefined,
      slug: corpo.invoice_slug ? String(corpo.invoice_slug) : undefined,
    });

    if (!confirmacao.pago) {
      console.warn("[infinitepay] aviso recebido mas nao confirmado:", orderNsu);
      return NextResponse.json({ ok: true });
    }

    // Pagou menos do que o pedido vale? Registra como pago mas não despacha:
    // fica para conferência manual no painel.
    const valorPago = confirmacao.valorPagoCents;
    const valorConfere = valorPago == null || valorPago >= pedido.totalCents;

    await prisma.order.update({
      where: { id: pedido.id },
      data: {
        paymentStatus: "PAID",
        status: valorConfere ? "PAID" : "AWAITING_PAYMENT",
        paidAmountCents: valorPago,
        paymentMethod: confirmacao.meio,
        infinitePaySlug: corpo.invoice_slug ? String(corpo.invoice_slug) : null,
        infinitePayOrderNsu: orderNsu,
      },
    });

    if (!valorConfere) {
      console.warn(
        `[infinitepay] pedido ${orderNsu}: pago ${valorPago} de ${pedido.totalCents}`,
      );
    }

    // Avisa a cliente, mas só quando o valor fecha: dizer "pagamento
    // confirmado" para quem pagou a menos criaria uma expectativa errada, e
    // esse caso vai para conferência manual no painel.
    if (valorConfere && pedido.customerEmail) {
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

      const { assunto, html } = emailPagamentoConfirmado({
        code: pedido.code,
        customerName: pedido.customerName,
        totalCents: pedido.totalCents,
        shippingCents: pedido.shippingCents,
        shippingService: pedido.shippingService,
        items: itens,
      });

      enviarEmailSemEsperar({ para: pedido.customerEmail, assunto, html });
    }

    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[infinitepay]", erro);
    // 400 faz a InfinitePay reenviar o aviso depois, que é o que queremos
    // quando o erro foi nosso.
    return NextResponse.json({ erro: "falha ao conferir" }, { status: 400 });
  }
}
