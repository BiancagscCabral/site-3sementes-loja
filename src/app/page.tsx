import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import FlipCard from "@/components/FlipCard";
import HeroCarousel from "@/components/HeroCarousel";
import { getCategoryBrand } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { listarMidiaDoHero } from "@/lib/hero";

// Categorias que ganham uma faixa própria na home, na ordem em que aparecem.
const FAIXAS = ["braceletes", "guias", "flores-eternas", "colares"];

function PolaroidIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-8 w-8"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <rect x="7" y="6" width="10" height="9" rx="1" />
      <path d="M9 18h6" strokeLinecap="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-8 w-8"
    >
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M3 13h18M12 9v12" strokeLinecap="round" />
      <path
        d="M12 9S10.5 4.5 8 4.5 5.5 9 12 9Zm0 0s1.5-4.5 4-4.5S18.5 9 12 9Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-8 w-8"
    >
      <rect x="2" y="8" width="20" height="8" rx="2" />
      <path d="M7 8v4M12 8v5M17 8v4" strokeLinecap="round" />
    </svg>
  );
}

export default async function Home() {
  const categorias = await prisma.category.findMany({
    where: { slug: { in: FAIXAS } },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });

  const faixas = FAIXAS.flatMap((slug) => {
    const categoria = categorias.find((item) => item.slug === slug);
    return categoria && categoria.products.length > 0 ? [categoria] : [];
  });

  const midiaDoHero = listarMidiaDoHero();

  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[340px] items-center bg-hero px-5 py-12 sm:min-h-[420px] sm:px-6">
        <HeroCarousel midia={midiaDoHero} />
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="max-w-[540px] border-l-[6px] border-accent bg-background px-7 py-8 sm:px-9">
            <h1 className="font-display text-[26px] font-bold leading-[1.25] text-foreground sm:text-[36px]">
              Produtos feitos à mão, sob medida, com carinho e cuidado.
            </h1>
            <p className="mt-3.5 text-base leading-7 text-muted">
              Braceletes sob medida, Guias, Colares e Flores eternas de
              chenille.
            </p>
            <Link
              href="#catalogo"
              className="mt-5 inline-block bg-accent px-7 py-3.5 text-[15px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Começar a comprar
            </Link>
          </div>
        </div>
      </section>

      <div id="catalogo" className="scroll-mt-28">
        {faixas.map((categoria) => {
          const brand = getCategoryBrand(categoria.slug);
          const total = categoria.products.length;
          return (
            <section
              key={categoria.slug}
              className={`${brand.themeClass} bg-background px-5 py-12 text-foreground sm:px-6 sm:py-14`}
            >
              <div className="mx-auto max-w-5xl">
                <div className="flex items-baseline gap-4 border-b-2 border-foreground pb-2.5">
                  <h2 className="text-[15px] font-bold uppercase tracking-[0.18em]">
                    {categoria.name}
                  </h2>
                  <Link
                    href={`/categorias/${categoria.slug}`}
                    className="ml-auto shrink-0 text-[13px] font-bold underline underline-offset-4"
                  >
                    {total === 1 ? "Ver a peça" : `Ver as ${total}`}
                  </Link>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-[26px]">
                  {categoria.products.slice(0, 4).map((produto) => (
                    <ProductCard
                      key={produto.slug}
                      slug={produto.slug}
                      name={produto.name}
                      priceCents={produto.priceCents}
                      image={produto.images[0]}
                      logo={brand.logo}
                      markClass={brand.markClass}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="border-b-2 border-foreground pb-2.5">
            <h2 className="text-[15px] font-bold uppercase tracking-[0.18em]">
              Acompanha no seu pedido
            </h2>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-3 sm:gap-[26px]">
            <FlipCard icon={<PolaroidIcon />} title="Card polaroid nas Flores">
              Mande a foto no WhatsApp depois do pedido.
            </FlipCard>
            <FlipCard icon={<GiftIcon />} title="Cartão presente nas Flores">
              Escreva a mensagem e a Imprimimos o Cartão.
            </FlipCard>
            <FlipCard icon={<RulerIcon />} title="Bracelete Sob Medida">
              Braceletes do P ao GG a gente ajuda a medir.
            </FlipCard>
          </div>
        </div>
      </section>

      <section id="sobre" className="scroll-mt-28 px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-8 sm:gap-10">
          <div className="h-[220px] w-full bg-primary sm:h-[280px] sm:w-[300px] sm:flex-[1_1_300px]" />
          <div className="min-w-0 sm:flex-[999_1_420px]">
            <h2 className="font-display text-[24px] font-bold sm:text-[28px]">
              Sobre Nós
            </h2>
            <p className="mt-3.5 max-w-[58ch] text-base leading-8 text-muted">
              A 3sementes começou em 2019, em Olinda, Pernambuco, Brasil. Hoje
              são braceletes, guias, colares e as flores eternas da linha
              3sflores | todos montados à mão, peça por peça, por encomenda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
