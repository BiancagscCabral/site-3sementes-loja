import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import { ehFotoEnviadaPeloPainel } from "@/lib/storage";
import { embalagemDaCategoria } from "@/lib/embalagem";
import FotosDoProduto from "@/components/FotosDoProduto";
import EmbalagemDoProduto from "@/components/EmbalagemDoProduto";

export const dynamic = "force-dynamic";

export default async function FotosDeUmProduto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) redirect("/admin");

  const { slug } = await params;

  const produto = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      colors: true,
      optionLabel: true,
      weightGrams: true,
      heightCm: true,
      widthCm: true,
      lengthCm: true,
      category: {
        select: {
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
      },
      images: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          url: true,
          altText: true,
          optionName: true,
        },
      },
    },
  });

  if (!produto) notFound();

  const estimativa = embalagemDaCategoria(produto.category.slug);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/produtos"
        className="text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Voltar para a lista
      </Link>

      <div className="mt-4 border-b-2 border-foreground pb-2.5">
        <h1 className="font-display text-[26px] font-bold leading-tight">
          {produto.name}
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {produto.category.name} · {produto.images.length} foto
          {produto.images.length === 1 ? "" : "s"}
        </p>
      </div>

      <FotosDoProduto
        slug={produto.slug}
        opcoes={produto.colors}
        rotuloDaOpcao={produto.optionLabel ?? "Cor"}
        fotos={produto.images.map((foto) => ({
          ...foto,
          veioDoPainel: ehFotoEnviadaPeloPainel(foto.url),
        }))}
      />

      <EmbalagemDoProduto
        slug={produto.slug}
        categoria={produto.category.name}
        produtosNaCategoria={produto.category._count.products}
        atual={{
          peso: produto.weightGrams,
          altura: produto.heightCm,
          largura: produto.widthCm,
          comprimento: produto.lengthCm,
        }}
        estimativa={{
          peso: estimativa.pesoGramas,
          altura: estimativa.alturaCm,
          largura: estimativa.larguraCm,
          comprimento: estimativa.comprimentoCm,
        }}
      />
    </div>
  );
}
