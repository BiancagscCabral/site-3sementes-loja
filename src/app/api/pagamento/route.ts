import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { passouDoLimite, quemEstaChamando } from "@/lib/limite";
import { criarPedido, ErroDePedido, type CorpoDoPedido } from "@/lib/pedidos";
import {
  criarLinkDePagamento,
  ErroDePagamento,
  pagamentoConfigurado,
} from "@/lib/infinitepay";
import { formatPriceCents } from "@/lib/format";

// Pedido pago no site: grava o pedido e devolve o endereço de pagamento.
export async function POST(request: Request) {
  if (passouDoLimite(`pagamento:${quemEstaChamando(request)}`, 5, 60)) {
    return NextResponse.json(
      { erro: "Muitas tentativas seguidas. Espere um minuto." },
      { status: 429 },
    );
  }

  if (!pagamentoConfigurado()) {
    return NextResponse.json({ configurado: false }, { status: 503 });
  }

  let corpo: CorpoDoPedido;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  let pedido;
  try {
    pedido = await criarPedido(corpo, "AWAITING_PAYMENT");
  } catch (erro) {
    if (erro instanceof ErroDePedido) {
      return NextResponse.json({ erro: erro.message }, { status: 400 });
    }
    console.error("[pagamento] ao gravar o pedido", erro);
    return NextResponse.json(
      { erro: "Não conseguimos registrar o pedido." },
      { status: 500 },
    );
  }

  try {
    const itens = pedido.items.map((item) => ({
      description: item.variantName
        ? `${item.productName} (${item.variantName})`
        : item.productName,
      quantity: item.quantity,
      price: item.unitPriceCents,
    }));

    // O frete vai como uma linha a mais, para o total cobrado bater com o pedido.
    if (pedido.shippingCents && pedido.shippingCents > 0) {
      itens.push({
        description: `Entrega — ${pedido.shippingService ?? "frete"}`,
        quantity: 1,
        price: pedido.shippingCents,
      });
    }

    const endereco = (pedido.shippingAddress ?? {}) as Record<string, string>;
    const link = await criarLinkDePagamento({
      orderNsu: pedido.code,
      itens,
      cliente: {
        nome: pedido.customerName,
        email: pedido.customerEmail,
        telefone: pedido.customerPhone,
      },
      endereco: {
        cep: endereco.cep,
        rua: endereco.rua,
        bairro: endereco.bairro,
        numero: endereco.numero,
        complemento: endereco.complemento,
      },
    });

    if (link.slug) {
      await prisma.order.update({
        where: { id: pedido.id },
        data: { infinitePaySlug: link.slug, infinitePayOrderNsu: pedido.code },
      });
    }

    return NextResponse.json({
      codigo: pedido.code,
      total: formatPriceCents(pedido.totalCents),
      url: link.url,
    });
  } catch (erro) {
    // O pedido já está gravado: a cliente não perde o que preencheu e a loja
    // ainda consegue fechar pelo WhatsApp.
    console.error("[pagamento] ao criar o link", erro);
    return NextResponse.json(
      {
        erro:
          erro instanceof ErroDePagamento
            ? erro.message
            : "Não conseguimos abrir o pagamento agora.",
        codigo: pedido.code,
      },
      { status: 502 },
    );
  }
}
