import Link from "next/link";
import ProductThumb from "@/components/ProductThumb";
import { CATEGORIES, getCategoryBrand } from "@/lib/catalog";
import { BANNER_SLIDES } from "@/lib/banner";
import HeroBanner from "@/components/HeroBanner";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <div className="flex flex-col">
      <HeroBanner slides={BANNER_SLIDES} />

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center sm:pt-20">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-xs uppercase tracking-wide text-muted">
          Feito à mão, com carinho
        </span>
        <h1 className="font-display mx-auto mt-6 max-w-2xl text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          Peças artesanais que viram presente
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted">
          Joias e flores eternas feitas à mão em Igarassu e Recife, uma peça
          de cada vez.
        </p>
        <Link
          href="#categorias"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
        >
          Ver categorias
        </Link>
      </section>

      <section
        id="categorias"
        className="scroll-mt-28 border-t border-border bg-surface px-6 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Compre por categoria
          </h2>
          <p className="mt-1 text-sm text-muted">
            Um mesmo cuidado em cada detalhe.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/categorias/${category.slug}`}
                className={`${getCategoryBrand(category.slug).themeClass} flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-7 text-center text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-secondary hover:text-secondary-foreground`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Da vitrine
            </h2>
            <p className="mt-1 text-sm text-muted">
              Uma seleção do ateliê pronta para encantar.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featuredProducts.map((product) => {
                const brand = getCategoryBrand(product.category.slug);
                return (
                  <Link
                    key={product.slug}
                    href={`/produtos/${product.slug}`}
                    className={`${brand.themeClass} group rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40`}
                  >
                    <ProductThumb
                      image={product.images[0]}
                      logo={brand.logo}
                      markClass={brand.markClass}
                      className="aspect-square rounded-xl"
                    />
                    <p className="mt-3 text-xs uppercase tracking-wide text-muted">
                      {product.category.name}
                    </p>
                    <h3 className="mt-1 text-sm font-medium text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-accent">
                      {formatPriceCents(product.priceCents)}
                    </p>
                  </Link>
                  );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-surface px-6 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 text-center sm:grid-cols-3">
          <div>
            <p className="font-display text-lg text-foreground">
              Feito à mão
            </p>
            <p className="mt-1 text-sm text-muted">Peças únicas do ateliê</p>
          </div>
          <div>
            <p className="font-display text-lg text-foreground">
              Envio para o Brasil
            </p>
            <p className="mt-1 text-sm text-muted">
              Frete calculado para você
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-foreground">
              Atendimento no WhatsApp
            </p>
            <p className="mt-1 text-sm text-muted">
              Tire dúvidas e feche o pedido direto com a gente
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
