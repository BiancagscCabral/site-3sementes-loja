import { notFound } from "next/navigation";
import CabecalhoDaCategoria from "@/components/CabecalhoDaCategoria";
import ListaDaCategoria, {
  type ProdutoDaLista,
} from "@/components/ListaDaCategoria";
import { prisma } from "@/lib/prisma";
import { getCategoryBrand } from "@/lib/catalog";

// Estas categorias formam o grupo "Acessórios": a página de uma delas deixa
// marcar as outras no filtro, sem sair da tela.
const ACESSORIOS = [
  "braceletes",
  "colares",
  "pulseiras",
  "tornozeleiras",
  "aneis",
  "acessorios",
];

const SUBTITULOS: Record<string, string> = {
  braceletes: "Detalhes artesanais que transformam o seu estilo.",
  colares: "Colares e chokers feitos à mão para brilhar no dia a dia.",
  pulseiras: "Pulseiras com significado, feitas à mão para todos os dias.",
  tornozeleiras: "Leveza e cor para acompanhar cada passo.",
  aneis: "Anéis artesanais para completar o seu visual.",
  acessorios: "Acessórios feitos à mão, cheios de significado.",
  guias: "Guias e brajás feitos à mão, com cuidado e respeito em cada conta.",
  "flores-eternas":
    "Flores de chenille que nunca murcham, para presentear e decorar.",
  decoracao: "Peças feitas à mão para deixar a casa com a sua cara.",
};

export default async function CategoryPage(
  props: PageProps<"/categorias/[slug]">,
) {
  const { slug } = await props.params;
  const grupo = ACESSORIOS.includes(slug) ? ACESSORIOS : [slug];

  const categorias = await prisma.category.findMany({
    where: { slug: { in: grupo } },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });

  const atual = categorias.find((categoria) => categoria.slug === slug);
  if (!atual) {
    notFound();
  }

  const brand = getCategoryBrand(atual.slug);

  // Todas as peças do grupo, das mais novas para as mais antigas ("Destaques").
  const produtos: ProdutoDaLista[] = categorias
    .flatMap((categoria) =>
      categoria.products.map((produto) => ({ categoria, produto })),
    )
    .sort(
      (a, b) => b.produto.createdAt.getTime() - a.produto.createdAt.getTime(),
    )
    .map(({ categoria, produto }) => ({
      slug: produto.slug,
      name: produto.name,
      priceCents: produto.priceCents,
      colors: produto.colors,
      sizes: produto.sizes,
      optionLabel: produto.optionLabel,
      image: produto.images[0]
        ? { url: produto.images[0].url, altText: produto.images[0].altText }
        : null,
      categoriaSlug: categoria.slug,
    }));

  const irmas = grupo.flatMap((irmaSlug) => {
    const categoria = categorias.find((item) => item.slug === irmaSlug);
    return categoria && categoria.products.length > 0
      ? [
          {
            slug: categoria.slug,
            name: categoria.name,
            total: categoria.products.length,
          },
        ]
      : [];
  });

  const trilha =
    grupo.length === 1
      ? [{ rotulo: "Início", href: "/" }, { rotulo: atual.name }]
      : slug === "acessorios"
        ? [{ rotulo: "Início", href: "/" }, { rotulo: "Acessórios" }]
        : [
            { rotulo: "Início", href: "/" },
            { rotulo: "Acessórios" },
            { rotulo: atual.name },
          ];

  return (
    <div className={`${brand.themeClass} bg-background text-foreground`}>
      <CabecalhoDaCategoria
        slug={slug}
        trilha={trilha}
        titulo={atual.name}
        subtitulo={
          SUBTITULOS[slug] ?? "Peças feitas à mão, cheias de significado."
        }
      />

      {produtos.length === 0 ? (
        <p className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted sm:px-6">
          Ainda não temos produtos cadastrados nessa categoria.
        </p>
      ) : (
        <ListaDaCategoria
          produtos={produtos}
          categoriaAtual={slug}
          irmas={irmas}
        />
      )}
    </div>
  );
}
