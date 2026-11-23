import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import CabecalhoDoPainel from "@/components/admin/CabecalhoDoPainel";
import EmBreve from "@/components/admin/EmBreve";
import GradeDeProdutos from "@/components/admin/GradeDeProdutos";
import { IconeMais, IconeNuvem } from "@/components/Icones";

export const dynamic = "force-dynamic";

export default async function ProdutosDoAdmin({
  searchParams,
}: PageProps<"/admin/produtos">) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) redirect("/admin");

  const parametros = await searchParams;
  const categoriaInicial =
    typeof parametros.categoria === "string" ? parametros.categoria : "";

  const [produtos, categorias] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      select: {
        slug: true,
        name: true,
        priceCents: true,
        weightGrams: true,
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: { position: "asc" },
          take: 1,
          select: { url: true, altText: true },
        },
        _count: { select: { images: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const semPeso = produtos.filter((p) => p.weightGrams === null).length;

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10">
      <CabecalhoDoPainel
        titulo="Produtos"
        subtitulo="Adicione, edite e organize os produtos da sua loja."
      >
        <span
          aria-disabled
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-full bg-primary/55 px-6 text-[15px] font-semibold text-primary-foreground"
        >
          <IconeMais className="h-[18px] w-[18px]" />
          Adicionar produto
          <EmBreve />
        </span>
      </CabecalhoDoPainel>

      <div
        aria-disabled
        className="relative mt-6 flex cursor-not-allowed flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-primary/40 px-6 py-7 text-center"
      >
        <IconeNuvem className="h-10 w-10 text-primary" />
        <p className="mt-1 text-[16px] font-bold text-foreground">
          Adicionar fotos de produtos
        </p>
        <p className="text-[13px] text-muted">
          Arraste e solte suas imagens aqui ou clique para escolher
        </p>
        <EmBreve className="mt-2" />
      </div>

      {semPeso > 0 && (
        <p className="mt-5 rounded-2xl bg-muted-bg px-4 py-3 text-[13px] leading-[1.6] text-foreground">
          <strong>{semPeso}</strong> produto{semPeso > 1 ? "s" : ""} ainda{" "}
          {semPeso > 1 ? "usam" : "usa"} peso e medida estimados no cálculo do
          frete. Se a estimativa for menor que a embalagem real, a diferença sai
          do seu bolso em cada venda. Abra um produto para cadastrar, e lá dá
          para aplicar à categoria inteira de uma vez.
        </p>
      )}

      <GradeDeProdutos
        categoriaInicial={categoriaInicial}
        categorias={categorias.map((c) => ({ slug: c.slug, nome: c.name }))}
        produtos={produtos.map((p) => ({
          slug: p.slug,
          nome: p.name,
          preco: formatPriceCents(p.priceCents),
          categoria: p.category.name,
          categoriaSlug: p.category.slug,
          foto: p.images[0]
            ? { url: p.images[0].url, alt: p.images[0].altText ?? p.name }
            : null,
          totalDeFotos: p._count.images,
        }))}
      />
    </div>
  );
}
