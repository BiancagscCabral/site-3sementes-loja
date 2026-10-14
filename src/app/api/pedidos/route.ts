import { NextResponse } from "next/server";
import { passouDoLimite, quemEstaChamando } from "@/lib/limite";
import { criarPedido, ErroDePedido, type CorpoDoPedido } from "@/lib/pedidos";

// Pedido fechado pelo WhatsApp: grava antes de a cliente sair do site.
export async function POST(request: Request) {
  if (passouDoLimite(`pedido:${quemEstaChamando(request)}`, 5, 60)) {
    return NextResponse.json(
      { erro: "Muitos pedidos seguidos. Espere um minuto." },
      { status: 429 },
    );
  }

  let corpo: CorpoDoPedido;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  try {
    const pedido = await criarPedido(corpo, "AWAITING_CONTACT");
    return NextResponse.json({
      codigo: pedido.code,
      totalCents: pedido.totalCents,
    });
  } catch (erro) {
    if (erro instanceof ErroDePedido) {
      return NextResponse.json({ erro: erro.message }, { status: 400 });
    }
    console.error("[pedidos]", erro);
    return NextResponse.json(
      { erro: "Não conseguimos registrar o pedido." },
      { status: 500 },
    );
  }
}
