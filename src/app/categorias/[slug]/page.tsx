import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { CATEGORIES } from "@/lib/catalog";

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
      },
    },
  });

  if (!category) {
    notFound();
  }

  const icon = CATEGORIES.find((c) => c.slug === slug)?.icon ?? "✨";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        &larr; Voltar
      </Link>
      <h1 className="font-display mt-4 text-3xl font-medium text-foreground">
        {category.name}
      </h1>

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
              <div className="flex aspect-square items-center justify-center rounded-xl bg-background text-4xl">
                {icon}
              </div>
              <h2 className="mt-4 text-sm font-medium text-foreground">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {formatPriceCents(product.priceCents)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
