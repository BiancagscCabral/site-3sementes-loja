import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/ProductGallery";
import { ProductOptionProvider } from "@/components/ProductOptionContext";
import ProductPurchase from "@/components/ProductPurchase";
import { getCategoryBrand } from "@/lib/catalog";

function SeedlingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className="h-[17px] w-[17px]"
    >
      <path
        d="M12 3c1.8 3 1.8 5.2 0 7.5C10.2 8.2 10.2 6 12 3Z"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5c3.3 0 5.6 1.4 6.6 4.2-3.4.9-5.7.1-6.6-4.2Z"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5c-3.3 0-5.6 1.4-6.6 4.2 3.4.9 5.7.1 6.6-4.2Z"
        strokeLinejoin="round"
      />
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

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className="h-[17px] w-[17px]"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <rect x="7" y="6" width="10" height="9" rx="1" />
      <path d="M8 18h8" strokeLinecap="round" />
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
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border border-border text-foreground">
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
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const brand = getCategoryBrand(product.category.slug);
  const optionImages = Object.fromEntries(
    product.images
      .filter((image) => image.optionName)
      .map((image) => [image.optionName as string, image.url]),
  );
  const measurements = [
    product.heightCm ? `Altura ${product.heightCm} cm` : null,
    product.widthCm ? `Largura ${product.widthCm} cm` : null,
    product.lengthCm ? `Comprimento ${product.lengthCm} cm` : null,
    product.weightGrams ? `Peso ${product.weightGrams} g` : null,
  ].filter(Boolean);

  return (
    <div className={`${brand.themeClass} bg-background text-foreground`}>
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
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

        <ProductOptionProvider>
          <div className="mt-7 grid gap-14 sm:grid-cols-2">
            <ProductGallery
              images={product.images}
              logo={brand.logo}
              markClass={brand.markClass}
            />

            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                {product.category.name}
              </span>
              <h1 className="font-display mt-2.5 text-[30px] font-bold leading-[1.15] tracking-tight sm:text-[36px]">
                {product.name}
              </h1>

              <ProductPurchase
                image={product.images[0]?.url}
                productName={product.name}
                productSlug={product.slug}
                categorySlug={product.category.slug}
                priceCents={product.priceCents}
                sizes={product.sizes}
                colors={product.colors}
                optionLabel={product.optionLabel}
                optionImages={optionImages}
                stock={product.stock}
              />

              <div className="mt-7 flex flex-col gap-3.5 border-t border-border pt-6">
                {product.allowsGiftCard && (
                  <Assurance
                    icon={<CardIcon />}
                    title="Card polaroid ou cartão presente, sem custo"
                    note="Envie a foto ou a mensagem pelo WhatsApp depois do pedido"
                  />
                )}
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
        </ProductOptionProvider>

        {(product.description || measurements.length > 0) && (
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {product.description && (
              <div className="border border-border p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">Sobre a peça</h2>
                <p className="mt-2.5 text-[13px] leading-[1.7] text-muted">
                  {product.description}
                </p>
              </div>
            )}
            {measurements.length > 0 && (
              <div className="border border-border p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">Medidas</h2>
                <p className="mt-2.5 text-[13px] leading-[1.7] text-muted">
                  {measurements.join(" · ")}
                </p>
              </div>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-baseline gap-4 border-b-2 border-foreground pb-2.5">
              <h2 className="text-[15px] font-bold uppercase tracking-[0.18em]">
                Você também pode gostar
              </h2>
              <Link
                href={`/categorias/${product.category.slug}`}
                className="ml-auto shrink-0 text-[13px] font-bold underline underline-offset-4"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-[26px]">
              {related.map((item) => (
                <ProductCard
                  key={item.slug}
                  slug={item.slug}
                  name={item.name}
                  priceCents={item.priceCents}
                  image={item.images[0]}
                  logo={brand.logo}
                  markClass={brand.markClass}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
