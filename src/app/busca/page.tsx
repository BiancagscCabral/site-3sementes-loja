import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCategoryBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Busca | 3sementes",
};

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default async function BuscaPage(props: PageProps<"/busca">) {
  const { q } = await props.searchParams;
  const term = typeof q === "string" ? q.trim() : "";

  // Filtra em memória para ignorar acentos ("aneis" encontra "Anéis"), o que
  // o `contains` do Postgres não faz sem a extensão unaccent.
  const products = term
    ? await prisma.product.findMany({
        where: { active: true },
        include: {
          category: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
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
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-[26px] font-bold text-foreground sm:text-[30px]">
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
            href="/#catalogo"
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
          <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-[26px]">
            {results.map((product) => {
              const brand = getCategoryBrand(product.category.slug);
              return (
                <div key={product.slug} className={brand.themeClass}>
                  <ProductCard
                    slug={product.slug}
                    name={product.name}
                    priceCents={product.priceCents}
                    image={product.images[0]}
                    logo={brand.logo}
                    markClass={brand.markClass}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
