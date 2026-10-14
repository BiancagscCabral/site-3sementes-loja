import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
        <Link href="/" className="text-[13px] text-muted hover:text-foreground">
          &larr; Voltar
        </Link>

        <div className="mt-6 flex items-baseline gap-4 border-b-2 border-foreground pb-2.5">
          <h1 className="text-[15px] font-bold uppercase tracking-[0.18em]">
            {category.name}
          </h1>
          <span className="ml-auto shrink-0 text-[13px] text-muted">
            {category.products.length}{" "}
            {category.products.length === 1 ? "peça" : "peças"}
          </span>
        </div>

        {category.products.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            Ainda não temos produtos cadastrados nessa categoria.
          </p>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-[26px]">
            {category.products.map((product) => (
              <ProductCard
                key={product.slug}
                slug={product.slug}
                name={product.name}
                priceCents={product.priceCents}
                image={product.images[0]}
                logo={brand.logo}
                markClass={brand.markClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
