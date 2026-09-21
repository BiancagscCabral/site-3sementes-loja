import Link from "next/link";
import Image from "next/image";
import ProductThumb from "@/components/ProductThumb";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { getCategoryBrand } from "@/lib/catalog";

export default async function CategoryPage(
  props: PageProps<"/categorias/[slug]">,
) {
  const { slug } = await props.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const brand = getCategoryBrand(category.slug);

  return (
    <div className={`${brand.themeClass} bg-background text-foreground`}>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Voltar
        </Link>

        {brand.isFlores ? (
          <div className="mt-6 flex items-center gap-6">
            <Image
              src={brand.logo}
              alt="3sflores"
              width={120}
              height={120}
              priority
              className="h-[120px] w-[120px]"
            />
            <div>
              <h1 className="font-display text-4xl font-semibold text-foreground">
                {category.name}
              </h1>
              <p className="mt-1 max-w-md text-sm text-muted">
                Flores de chenille feitas à mão, do primeiro ateliê de flores
                eternas de Recife.
              </p>
            </div>
          </div>
        ) : (
          <h1 className="font-display mt-4 text-3xl font-medium text-foreground">
            {category.name}
          </h1>
        )}

        {category.products.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            Ainda não temos produtos cadastrados nessa categoria.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {category.products.map((product) => (
              <Link
                key={product.slug}
                href={`/produtos/${product.slug}`}
                className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <ProductThumb
                  image={product.images[0]}
                  logo={brand.logo}
                  markClass={brand.markClass}
                  markSize={56}
                  className="aspect-square rounded-xl"
                />
                <h2 className="mt-4 text-sm font-medium text-foreground">
                  {product.name}
                </h2>
                <p
                  className={`mt-1 text-sm ${brand.isFlores ? "text-accent" : "text-muted"}`}
                >
                  {formatPriceCents(product.priceCents)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
