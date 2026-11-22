import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import FlipCard from "@/components/FlipCard";
import BannerDoTopo from "@/components/BannerDoTopo";
import BannerDaFlores from "@/components/BannerDaFlores";
import { Flor, FormaDeFlor } from "@/components/Grafismos";
import {
  IconeAcessorios,
  IconeAjustes,
  IconeBraceletes,
  IconeBuque,
  IconeCaminhao,
  IconeColares,
  IconeGuias,
  IconeFolha,
  IconeSeta,
  IconeWhatsApp,
} from "@/components/Icones";
import { INSTAGRAM_LINKS, WHATSAPP_URL } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { listarMidiaDoHero } from "@/lib/hero";

// A home busca os produtos no banco. Sem isto o Next congelaria a pagina no
// momento da publicacao e preco novo, produto novo ou foto nova so apareceriam
// no proximo deploy. Com 300, ela se atualiza sozinha a cada 5 minutos.
export const revalidate = 300;

// Categorias de onde saem as peças da vitrine e as fotos do topo.
const FAIXAS = ["braceletes", "guias", "flores-eternas", "colares"];

// Os cinco atalhos em forma de flor. Cada um tem a sua cor da paleta.
const ATALHOS = [
  {
    slug: "braceletes",
    nome: "Braceletes",
    Icone: IconeBraceletes,
    cor: "text-secondary",
    // O desenho dos braceletes é mais alto e largo que os ícones de linha.
    tamanho: "h-11 w-9 sm:h-[76px] sm:w-[62px]",
  },
  {
    slug: "colares",
    nome: "Colares e Chokers",
    Icone: IconeColares,
    cor: "text-rose",
    // Desenho quase quadrado, como o dos braceletes.
    tamanho: "h-9 w-8 sm:h-[76px] sm:w-[67px]",
  },
  {
    slug: "guias",
    nome: "Guias e Brajás",
    Icone: IconeGuias,
    cor: "text-sun",
    // O colar é bem mais alto que largo.
    tamanho: "h-11 w-[21px] sm:h-[76px] sm:w-[36px]",
  },
  {
    slug: "flores-eternas",
    nome: "3SFlores",
    Icone: IconeBuque,
    cor: "text-rose/60",
    // O desenho do buquê é quadrado e cheio, como o dos braceletes.
    tamanho: "h-11 w-11 sm:h-[76px] sm:w-[74px]",
  },
  {
    slug: "acessorios",
    nome: "Mais acessórios",
    Icone: IconeAcessorios,
    cor: "text-primary/25",
    // Desenho de arame com contas, quadrado como os outros ícones em arte.
    tamanho: "h-11 w-11 sm:h-[76px] sm:w-[76px]",
  },
];

const BENEFICIOS = [
  {
    Icone: IconeCaminhao,
    titulo: "Envio para todo o Brasil",
    texto: "com rastreamento",
  },
  {
    Icone: IconeFolha,
    titulo: "Produção artesanal",
    texto: "peças únicas e feitas à mão",
  },
  {
    Icone: IconeAjustes,
    titulo: "Personalização exclusiva",
    texto: "do seu jeito",
  },
];

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

// Título de seção com uma linha curta de cada lado.
function TituloDeSecao({
  children,
  className = "text-[26px] sm:text-[34px]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      <span
        aria-hidden
        className="h-0.5 w-8 rounded-full bg-primary/70 sm:w-16"
      />
      <h2
        className={`text-center font-display font-semibold leading-tight text-primary ${className}`}
      >
        {children}
      </h2>
      <span
        aria-hidden
        className="h-0.5 w-8 rounded-full bg-primary/70 sm:w-16"
      />
    </div>
  );
}

type ProdutoDaVitrine = {
  slug: string;
  name: string;
  priceCents: number;
  colors: string[];
  optionLabel: string | null;
  images: { url: string; altText: string | null }[];
};

// Faixa de produtos em carrossel, com título centralizado.
function Vitrine({
  id,
  titulo,
  produtos,
}: {
  id: string;
  titulo: string;
  produtos: ProdutoDaVitrine[];
}) {
  return (
    <section id={id} className="scroll-mt-28 px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <TituloDeSecao>{titulo}</TituloDeSecao>

        <div className="mt-7">
          <ProductCarousel rotulo={titulo} automatico>
            {produtos.map((produto) => (
              <div
                key={produto.slug}
                className="w-[44%] shrink-0 snap-start sm:w-[calc((100%-78px)/4)]"
              >
                <ProductCard
                  slug={produto.slug}
                  name={produto.name}
                  priceCents={produto.priceCents}
                  image={produto.images[0]}
                  colors={produto.colors}
                  optionLabel={produto.optionLabel}
                  sizes="(max-width: 640px) 44vw, 240px"
                />
              </div>
            ))}
          </ProductCarousel>
        </div>
      </div>
    </section>
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

  const comFoto = {
    images: { orderBy: { position: "asc" as const }, take: 1 },
  };

  // Novidades: as peças mais recentes da loja, de todas as categorias.
  const novidades = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: comFoto,
  });

  // Mais vendidos: soma das unidades de pedidos já pagos (pagos, postados ou
  // finalizados; pedido cancelado ou à espera de pagamento não conta). Se ainda
  // não houver vendas suficientes, a seção não aparece: não dá para chamar de
  // "mais vendido" o que não vendeu.
  const vendidos = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 12,
  });
  const produtosVendidos = vendidos.length
    ? await prisma.product.findMany({
        where: {
          id: { in: vendidos.map((item) => item.productId) },
          active: true,
        },
        include: comFoto,
      })
    : [];
  const maisVendidos = vendidos.flatMap((item) => {
    const produto = produtosVendidos.find((p) => p.id === item.productId);
    return produto ? [produto] : [];
  });

  // Primeira peça com foto de uma categoria (para o topo e o banner).
  const fotoDaCategoria = (slug: string) => {
    const produto = faixas
      .find((categoria) => categoria.slug === slug)
      ?.products.find((item) => item.images[0]);
    return produto
      ? {
          url: produto.images[0].url,
          alt: produto.images[0].altText ?? produto.name,
        }
      : null;
  };

  // Fotos do topo: se houver arquivos em public/img/hero, eles têm prioridade;
  // senão, entram fotos de peças da loja.
  const midiaDoHero = listarMidiaDoHero();
  const fotosDoTopo =
    midiaDoHero.length > 0
      ? midiaDoHero
      : ["flores-eternas", "braceletes", "guias"].flatMap((slug) => {
          const foto = fotoDaCategoria(slug);
          return foto ? [{ ...foto, tipo: "imagem" as const }] : [];
        });

  return (
    <div className="flex flex-col">
      <BannerDoTopo fotos={fotosDoTopo} />

      <section
        id="categorias"
        className="relative scroll-mt-28 overflow-hidden px-5 pb-6 pt-6 sm:px-6"
      >
        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-3 gap-y-5 sm:gap-x-5">
          {ATALHOS.map(({ slug, nome, Icone, cor, tamanho }) => (
            <li
              key={slug}
              className="w-[calc(33.333%-0.5rem)] sm:w-[calc(20%-1rem)]"
            >
              <Link
                href={`/categorias/${slug}`}
                className="atalho-flor relative flex aspect-square flex-col items-center justify-center text-center text-foreground"
              >
                <FormaDeFlor
                  className={`atalho-forma absolute inset-0 h-full w-full ${cor}`}
                />
                <span className="relative flex flex-col items-center gap-1 px-2 sm:gap-1.5">
                  <Icone
                    className={`text-primary ${tamanho ?? "h-6 w-6 sm:h-10 sm:w-10"}`}
                  />
                  <span className="font-display text-[12px] font-semibold leading-tight sm:text-[17px]">
                    {nome}
                  </span>
                  <IconeSeta className="hidden h-4 w-4 text-primary sm:block" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-4 sm:px-6">
        <ul className="mx-auto grid max-w-5xl gap-4 rounded-3xl bg-muted-bg px-6 py-5 sm:grid-cols-3 sm:gap-0 sm:px-4">
          {BENEFICIOS.map(({ Icone, titulo, texto }, indice) => (
            <li
              key={titulo}
              className={`flex items-center gap-4 sm:justify-center ${
                indice > 0 ? "sm:border-l sm:border-border" : ""
              }`}
            >
              <Icone className="h-9 w-9 shrink-0 text-primary" />
              <span className="leading-tight">
                <span className="block text-[15px] font-bold text-foreground">
                  {titulo}
                </span>
                <span className="block text-[13px] text-muted">{texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {maisVendidos.length >= 4 && (
        <Vitrine
          id="mais-vendidos"
          titulo="Mais vendidos"
          produtos={maisVendidos}
        />
      )}

      <BannerDaFlores />

      {novidades.length > 0 && (
        <Vitrine id="novidades" titulo="Novidades" produtos={novidades} />
      )}

      <section className="px-5 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <TituloDeSecao className="text-[24px] sm:text-[30px]">
            Acompanha no seu pedido
          </TituloDeSecao>
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

      <section
        id="sobre"
        className="scroll-mt-28 px-5 pb-12 pt-2 sm:px-6 sm:pb-16"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-8 sm:gap-10">
          <div className="flex h-[220px] w-full items-center justify-center rounded-3xl bg-secondary sm:h-[280px] sm:w-[300px] sm:flex-[1_1_300px]">
            <Image src="/img/flor.png" alt="" width={150} height={150} />
          </div>
          <div className="min-w-0 sm:flex-[999_1_420px]">
            <h2 className="font-display text-[26px] font-semibold text-primary sm:text-[30px]">
              Sobre Nós
            </h2>
            <p className="mt-3.5 max-w-[58ch] text-base leading-8 text-foreground">
              A 3sementes começou em 2019, em Olinda, Pernambuco, Brasil. Hoje
              são braceletes, guias, colares e as flores eternas da linha
              3sflores | todos montados à mão, peça por peça, por encomenda.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary px-5 py-10 text-primary-foreground sm:px-6">
        <Flor
          miolo="var(--primary)"
          className="pointer-events-none absolute -bottom-8 -left-8 hidden h-28 w-28 text-sun sm:block"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <IconeWhatsApp className="hidden h-11 w-11 shrink-0 text-sun sm:block" />
            <div>
              <p className="font-display text-[22px] font-medium leading-tight">
                Quer uma peça sob medida?
              </p>
              <p className="mt-1 text-[15px]">
                Fale com a gente no WhatsApp ou siga no Instagram.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-sun px-6 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-surface"
            >
              Chamar no WhatsApp
            </a>
            {INSTAGRAM_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
