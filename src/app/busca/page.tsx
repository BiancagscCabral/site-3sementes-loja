import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { getCategoryBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Busca | 3sementes",
};

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default async function BuscaPage(props: PageProps<"/busca">) {
  const { q } = await props.searchParams;
  const term = typeof q === "string" ? q.trim() : "";

  // Filtra em memória para ignorar acentos ("aneis" encontra "Anéis"), o que
  // o `contains` do Postgres não faz sem a extensão unaccent.
  const products = term
    ? await prisma.product.findMany({
        where: { active: true },
        include: { category: true },
        orderBy: { name: "asc" },
      })
    : [];

  const normalizedTerm = normalize(term);
  const results = products.filter(
    (product) =>
      normalize(product.name).includes(normalizedTerm) ||
      normalize(product.category.name).includes(normalizedTerm),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl font-medium text-foreground">
        {term ? `Resultados para "${term}"` : "Buscar produtos"}
      </h1>

      {!term ? (
        <p className="mt-4 text-sm text-muted">
          Digite o que você procura na barra de busca acima.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Não encontramos nenhuma peça com esse nome. Tente outra palavra ou{" "}
          <Link
            href="/#categorias"
            className="text-accent underline underline-offset-4"
          >
            veja todas as categorias
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            {results.length === 1
              ? "1 peça encontrada"
              : `${results.length} peças encontradas`}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {results.map((product) => {
              const brand = getCategoryBrand(product.category.slug);
              return (
                <Link
                  key={product.slug}
                  href={`/produtos/${product.slug}`}
                  className={`${brand.themeClass} rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40`}
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background">
                    <Image
                      src={brand.logo}
                      alt=""
                      width={52}
                      height={52}
                      className={brand.markClass}
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted">
                    {product.category.name}
                  </p>
                  <h2 className="mt-1 text-sm font-medium text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-accent">
                    {formatPriceCents(product.priceCents)}
                  </p>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
