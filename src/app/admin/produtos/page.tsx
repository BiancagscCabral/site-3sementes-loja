import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

export default async function ProdutosDoAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) redirect("/admin");

  const produtos = await prisma.product.findMany({
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      weightGrams: true,
      category: { select: { name: true } },
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true, altText: true },
      },
      _count: { select: { images: true } },
    },
  });

  // Quem não tem foto vem primeiro: é o que falta resolver.
  const semFoto = produtos.filter((p) => p._count.images === 0);
  const comFoto = produtos.filter((p) => p._count.images > 0);
  const semPeso = produtos.filter((p) => p.weightGrams === null).length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-baseline gap-4 border-b-2 border-foreground pb-2.5">
        <h1 className="text-[15px] font-bold uppercase tracking-[0.18em]">
          Fotos dos produtos
        </h1>
        <span className="text-[13px] text-muted">
          {semFoto.length} sem foto, {comFoto.length} com foto
        </span>
      </div>

      {semPeso > 0 && (
        <p className="mt-5 rounded-lg border border-border bg-muted-bg/60 px-3 py-2.5 text-[12px] leading-[1.6] text-muted">
          <strong>{semPeso}</strong> produto{semPeso > 1 ? "s" : ""} ainda{" "}
          {semPeso > 1 ? "usam" : "usa"} peso e medida estimados no cálculo do
          frete. Se a estimativa for menor que a embalagem real, a diferença sai
          do seu bolso em cada venda. Abra um produto para cadastrar, e lá dá
          para aplicar à categoria inteira de uma vez.
        </p>
      )}

      {semFoto.length > 0 && (
        <Secao titulo="Ainda sem foto" produtos={semFoto} />
      )}
      {comFoto.length > 0 && <Secao titulo="Já com foto" produtos={comFoto} />}
    </div>
  );
}

type ProdutoDaLista = {
  slug: string;
  name: string;
  weightGrams: number | null;
  category: { name: string };
  images: { url: string; altText: string | null }[];
  _count: { images: number };
};

function Secao({
  titulo,
  produtos,
}: {
  titulo: string;
  produtos: ProdutoDaLista[];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        {titulo}
      </h2>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {produtos.map((produto) => (
          <li key={produto.slug}>
            <Link
              href={`/admin/produtos/${produto.slug}`}
              className="group block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-foreground"
            >
              <span className="relative block aspect-square bg-muted-bg">
                {produto.images[0] ? (
                  <Image
                    src={produto.images[0].url}
                    alt={produto.images[0].altText ?? produto.name}
                    fill
                    sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[12px] text-muted">
                    sem foto
                  </span>
                )}
              </span>

              <span className="block px-3 py-2.5">
                <span className="line-clamp-2 block text-[13px] font-medium leading-snug">
                  {produto.name}
                </span>
                <span className="mt-1 block text-[11px] text-muted">
                  {produto.category.name}
                  {produto._count.images > 0 &&
                    ` · ${produto._count.images} foto${
                      produto._count.images > 1 ? "s" : ""
                    }`}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
