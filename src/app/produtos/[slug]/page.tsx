import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import { getCategoryBrand } from "@/lib/catalog";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function SeedlingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className="h-[17px] w-[17px]"
    >
      <path d="M12 3c1.8 3 1.8 5.2 0 7.5C10.2 8.2 10.2 6 12 3Z" strokeLinejoin="round" />
      <path d="M12 10.5c3.3 0 5.6 1.4 6.6 4.2-3.4.9-5.7.1-6.6-4.2Z" strokeLinejoin="round" />
      <path d="M12 10.5c-3.3 0-5.6 1.4-6.6 4.2 3.4.9 5.7.1 6.6-4.2Z" strokeLinejoin="round" />
      <path d="M12 14.7V21" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className="h-[17px] w-[17px]"
    >
      <path d="M3 8h10v9H3z" strokeLinejoin="round" />
      <path d="M13 11h4l3 3v3h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function Assurance({
  icon,
  title,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <span>
        <span className="block text-[13px] font-semibold">{title}</span>
        <span className="block text-[13px] text-muted">{note}</span>
      </span>
    </div>
  );
}

export default async function ProductPage(
  props: PageProps<"/produtos/[slug]">,
) {
  const { slug } = await props.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });

  if (!product || !product.active) {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const brand = getCategoryBrand(product.category.slug);
  const isNew = Date.now() - product.createdAt.getTime() < THIRTY_DAYS_MS;
  const measurements = [
    product.heightCm ? `Altura ${product.heightCm} cm` : null,
    product.widthCm ? `Largura ${product.widthCm} cm` : null,
    product.lengthCm ? `Comprimento ${product.lengthCm} cm` : null,
    product.weightGrams ? `Peso ${product.weightGrams} g` : null,
  ].filter(Boolean);

  return (
    <div className={`${brand.themeClass} bg-background text-foreground`}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <nav className="flex items-center gap-2 text-[13px] text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <span>/</span>
          <Link
            href={`/categorias/${product.category.slug}`}
            className="transition-colors hover:text-foreground"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-7 grid gap-14 sm:grid-cols-2">
          <ProductGallery
            images={product.images}
            isNew={isNew}
            logo={brand.logo}
            markClass={brand.markClass}
          />

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {product.category.name}
            </span>
            <h1 className="font-display mt-2.5 text-[40px] font-medium leading-[1.1] tracking-tight">
              {product.name}
            </h1>

            <ProductPurchase
              productName={product.name}
              productSlug={product.slug}
              categorySlug={product.category.slug}
              priceCents={product.priceCents}
              variants={product.variants}
              stock={product.stock}
            />

            <div className="mt-7 flex flex-col gap-3.5 border-t border-border pt-6">
              <Assurance
                icon={<SeedlingIcon />}
                title="Feito à mão no ateliê"
                note="Cada peça é montada uma a uma"
              />
              <Assurance
                icon={<TruckIcon />}
                title="Envio para todo o Brasil"
                note="Combine o frete pelo WhatsApp"
              />
            </div>
          </div>
        </div>

        {(product.description || measurements.length > 0) && (
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {product.description && (
              <div className="rounded-2xl border border-border bg-surface p-[22px]">
                <h2 className="font-display text-[17px] font-medium">Sobre a peça</h2>
                <p className="mt-2.5 text-[13px] leading-[1.7] text-muted">
                  {product.description}
                </p>
              </div>
            )}
            {measurements.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-[22px]">
                <h2 className="font-display text-[17px] font-medium">Medidas</h2>
                <p className="mt-2.5 text-[13px] leading-[1.7] text-muted">
                  {measurements.join(" · ")}
                </p>
              </div>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="font-display text-xl font-medium sm:text-2xl">
                Você também pode gostar
              </h2>
              <Link
                href={`/categorias/${product.category.slug}`}
                className="text-[13px] text-primary transition-colors hover:text-foreground"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-[18px] sm:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/produtos/${item.slug}`}
                  className="rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:border-accent/40"
                >
                  <span className="flex h-[168px] items-center justify-center overflow-hidden rounded-xl bg-background">
                    <Image
                      src={brand.logo}
                      alt=""
                      width={52}
                      height={52}
                      className={brand.markClass}
                    />
                  </span>
                  <span className="mt-3 block text-[11px] uppercase tracking-[0.12em] text-muted">
                    {product.category.name}
                  </span>
                  <span className="mt-1 block text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="mt-1 block text-sm text-accent">
                    {formatPriceCents(item.priceCents)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
