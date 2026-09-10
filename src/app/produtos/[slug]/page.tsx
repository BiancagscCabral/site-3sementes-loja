import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { CATEGORIES, getWhatsAppUrl } from "@/lib/catalog";

export default async function ProductPage(
  props: PageProps<"/produtos/[slug]">,
) {
  const { slug } = await props.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) {
    notFound();
  }

  const icon =
    CATEGORIES.find((c) => c.slug === product.category.slug)?.icon ?? "✨";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href={`/categorias/${product.category.slug}`}
        className="text-sm text-muted hover:text-foreground"
      >
        &larr; {product.category.name}
      </Link>

      <div className="mt-6 grid gap-10 sm:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface text-8xl">
          {icon}
        </div>

        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl text-accent">
            {formatPriceCents(product.priceCents)}
          </p>
          <p className="mt-6 text-base leading-7 text-muted">
            {product.description}
          </p>
          <a
            href={getWhatsAppUrl(`Olá! Tenho interesse em: ${product.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            Comprar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
