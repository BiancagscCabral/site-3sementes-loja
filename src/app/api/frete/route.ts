import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embalagemDaCategoria, type Embalagem } from "@/lib/embalagem";
import {
  cotarFrete,
  ErroDeFrete,
  freteConfigurado,
  type ItemParaFrete,
} from "@/lib/superfrete";

type ItemRecebido = { slug: string; quantidade: number };

// O navegador manda só o que o cliente escolheu; o peso e as medidas vêm do
// banco, para ninguém poder forjar uma caixa menor e pagar menos frete.
export async function POST(request: Request) {
  if (!freteConfigurado()) {
    return NextResponse.json({ configurado: false, opcoes: [] });
  }

  let corpo: { cep?: string; itens?: ItemRecebido[] };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const cep = String(corpo.cep ?? "");
  const itens = Array.isArray(corpo.itens) ? corpo.itens : [];
  if (itens.length === 0) {
    return NextResponse.json({ erro: "Sacola vazia." }, { status: 400 });
  }

  const produtos = await prisma.product.findMany({
    where: { slug: { in: itens.map((item) => String(item.slug)) } },
    select: {
      slug: true,
      weightGrams: true,
      heightCm: true,
      widthCm: true,
      lengthCm: true,
      category: { select: { slug: true } },
    },
  });

  const paraFrete: ItemParaFrete[] = [];
  for (const item of itens) {
    const produto = produtos.find((p) => p.slug === item.slug);
    if (!produto) continue;

    const padrao = embalagemDaCategoria(produto.category.slug);
    const embalagem: Embalagem = {
      alturaCm: produto.heightCm ?? padrao.alturaCm,
      larguraCm: produto.widthCm ?? padrao.larguraCm,
      comprimentoCm: produto.lengthCm ?? padrao.comprimentoCm,
      pesoGramas: produto.weightGrams ?? padrao.pesoGramas,
    };

    const quantidade = Math.min(Math.max(Number(item.quantidade) || 1, 1), 50);
    paraFrete.push({ embalagem, quantidade });
  }

  if (paraFrete.length === 0) {
    return NextResponse.json({ erro: "Produtos não encontrados." }, { status: 400 });
  }

  try {
    const opcoes = await cotarFrete(cep, paraFrete);
    return NextResponse.json({ configurado: true, opcoes });
  } catch (erro) {
    const mensagem =
      erro instanceof ErroDeFrete
        ? erro.message
        : "Não conseguimos calcular o frete agora.";
    console.error("[frete]", erro);
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}
