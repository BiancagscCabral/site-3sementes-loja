import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceForSize } from "@/lib/catalog";
import { passouDoLimite, quemEstaChamando } from "@/lib/limite";

type ItemRecebido = {
  slug: string;
  quantidade: number;
  tamanho?: string | null;
  variacao?: string | null;
};

type Corpo = {
  cliente?: {
    nome?: string;
    telefone?: string;
    email?: string;
  };
  endereco?: Record<string, string>;
  entrega?: {
    metodo?: string;
    servico?: string;
    precoCents?: number | null;
  };
  itens?: ItemRecebido[];
};

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0 e 1

function gerarCodigo() {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `3S-${codigo}`;
}

async function codigoInedito() {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigo();
    const existe = await prisma.order.findUnique({ where: { code: codigo } });
    if (!existe) return codigo;
  }
  throw new Error("não consegui gerar um código de pedido");
}

// Grava o pedido assim que a cliente finaliza no site, antes mesmo de ir para o
// WhatsApp. Os preços vêm do banco: o navegador só diz o que foi escolhido.
export async function POST(request: Request) {
  if (passouDoLimite(`pedido:${quemEstaChamando(request)}`, 5, 60)) {
    return NextResponse.json(
      { erro: "Muitos pedidos seguidos. Espere um minuto." },
      { status: 429 },
    );
  }

  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const nome = String(corpo.cliente?.nome ?? "").trim();
  const telefone = String(corpo.cliente?.telefone ?? "").trim();
  const itens = Array.isArray(corpo.itens) ? corpo.itens : [];

  if (!nome || !telefone || itens.length === 0) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  const produtos = await prisma.product.findMany({
    where: { slug: { in: itens.map((item) => String(item.slug)) } },
    select: { id: true, slug: true, name: true, priceCents: true },
  });

  const linhas = [];
  for (const item of itens) {
    const produto = produtos.find((p) => p.slug === item.slug);
    if (!produto) continue;

    const quantidade = Math.min(Math.max(Number(item.quantidade) || 1, 1), 50);
    const tamanho = item.tamanho ? String(item.tamanho) : null;

    linhas.push({
      productId: produto.id,
      productName: produto.name,
      variantName: item.variacao ? String(item.variacao) : null,
      quantity: quantidade,
      // O preço sai do banco, com o acréscimo do tamanho: assim ninguém fecha
      // um pedido com valor adulterado no navegador.
      unitPriceCents: priceForSize(produto.priceCents, tamanho),
    });
  }

  if (linhas.length === 0) {
    return NextResponse.json({ erro: "Produtos não encontrados." }, { status: 400 });
  }

  const produtosCents = linhas.reduce(
    (total, linha) => total + linha.unitPriceCents * linha.quantity,
    0,
  );
  const freteCents =
    typeof corpo.entrega?.precoCents === "number"
      ? Math.max(0, Math.round(corpo.entrega.precoCents))
      : null;

  try {
    const pedido = await prisma.order.create({
      data: {
        code: await codigoInedito(),
        customerName: nome,
        customerPhone: telefone,
        customerEmail: corpo.cliente?.email?.trim() || null,
        shippingAddress: corpo.endereco ?? {},
        deliveryMethod: corpo.entrega?.metodo ?? null,
        shippingService: corpo.entrega?.servico ?? null,
        shippingCents: freteCents,
        totalCents: produtosCents + (freteCents ?? 0),
        status: "AWAITING_CONTACT",
        items: { create: linhas },
      },
      select: { code: true, totalCents: true },
    });

    return NextResponse.json({ codigo: pedido.code, totalCents: pedido.totalCents });
  } catch (erro) {
    console.error("[pedidos]", erro);
    return NextResponse.json(
      { erro: "Não conseguimos registrar o pedido." },
      { status: 500 },
    );
  }
}
