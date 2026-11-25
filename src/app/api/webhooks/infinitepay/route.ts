import { NextResponse } from "next/server";
import { sincronizarPagamento } from "@/lib/sincronizar-pagamento";

// Aviso de pagamento da InfinitePay.
//
// O aviso não vem assinado, então ele serve apenas como "vá conferir o pedido
// tal". Quem decide se o pedido foi pago é a consulta de volta à InfinitePay,
// feita dentro de sincronizarPagamento.
//
// Este aviso é um atalho, não a única porta: a InfinitePay não promete
// retentativa nem entrega, então as telas também consultam. Se este aviso
// nunca chegar, o pagamento é descoberto do mesmo jeito.
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

  try {
    const resultado = await sincronizarPagamento(orderNsu, {
      transactionNsu: corpo.transaction_nsu
        ? String(corpo.transaction_nsu)
        : undefined,
      slug: corpo.invoice_slug ? String(corpo.invoice_slug) : undefined,
    });

    if (!resultado.mudou) {
      console.warn(`[infinitepay] aviso de ${orderNsu}: ${resultado.motivo}`);
    }

    // Sempre 200 quando não houve erro nosso, inclusive para pedido que não
    // existe: devolver erro faria a InfinitePay reenviar para sempre um aviso
    // que nunca vai servir.
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[infinitepay]", erro);
    // 400 faz a InfinitePay reenviar o aviso depois, que é o que queremos
    // quando o erro foi nosso.
    return NextResponse.json({ erro: "falha ao conferir" }, { status: 400 });
  }
}
