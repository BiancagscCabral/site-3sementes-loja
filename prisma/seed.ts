import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Catálogo migrado da Shopee (capturas de 13/09/2026). Preços em centavos, sem o desconto do Pix.
const CATALOG: { slug: string; name: string; products: [string, number][] }[] = [
  {
    slug: "guias",
    name: "Guias e Brajás",
    products: [
      ["Guia de Erê com Chupeta em Miçangas", 12000],
      ["Guia de Malandro em Miçangas | Sob Medida", 18000],
      ["Guia de Malandro em Miçangas Simples | Sob Medida", 12000],
      ["Guia de Oxalá em Miçangas | Sob Medida", 14990],
      ["Guia de Preto Velho em Miçangas | Sob Medida", 12000],
      ["Guia de Iansã (Oyá) em Miçangas | Cristal", 18000],
      ["Guia de Pomba Gira em Miçangas | Sob Medida", 12000],
      ["Brajá de Iemanjá em Miçangas | 3 fios | Sob Medida", 18000],
    ],
  },
  {
    slug: "braceletes",
    name: "Braceletes",
    products: [
      ["Bracelete de Braço Borboleta Delicado", 3090],
      ["Bracelete Oxóssi Feminino | Sob Medida", 4590],
      ["Bracelete Jade Feminino | Sob Medida", 3590],
      ["Bracelete com Flor | Prata | Sob Medida", 5590],
      ["Bracelete com Flor | Dourado | Sob Medida", 5590],
      ["Bracelete Aura Feminino | Sob Medida", 3590],
      ["Bracelete Oxum Feminino | Sob Medida", 5590],
      ["Bracelete Oxum Dourado Artesanal | Sob Medida", 5590],
      ["Bracelete Odoyá Feminino | Sob Medida", 5590],
      ["Bracelete Oyá - Iansã Feminino | Sob Medida", 5590],
      ["Bracelete Amuleto", 5590],
      ["Bracelete Iemanjá", 5590],
      ["Bracelete Sereia Feminino | Sob Medida", 3090],
      ["Bracelete Mari", 3990],
      ["Bracelete Feminino Simples | Exclusivo", 3590],
      ["Bracelete Odara Feminino | Sob Medida", 5590],
      ["Bracelete Iara Feminino | Sob Medida", 4090],
      ["Bracelete Maré Feminino | Sob Medida", 4090],
      ["Bracelete Borboleta Dourado e Prata | Artesanal", 5590],
      ["Bracelete Lia Ornamental", 4590],
      ["Bracelete Cigana Feminino | Sob Medida", 5590],
      ["Bracelete Astro Ornamental | Básico", 3590],
      ["Bracelete Espiral Feminino | Sob Medida", 4590],
      ["Bracelete Nanã Feminino | Sob Medida", 5590],
      ["Bracelete Fada Floral Dourado", 5590],
    ],
  },
  {
    slug: "colares",
    name: "Colares e Chokers",
    products: [
      ["Colar Sol de Pérolas", 3090],
      ["Colar de Miçangas", 2500],
      ["Colar do Axé em Miçangas | Artesanal", 4090],
      ["Colar Maia com Pedra Mística", 3590],
      ["Choker Flora", 5590],
      ["Choker Flora Prata", 5590],
      ["Choker Smile", 2500],
      ["Choker Miçangas Aloha", 2500],
      ["Choker Arco-íris LGBTQIA+ Branco", 2500],
      ["Choker Íris Branca", 2500],
    ],
  },
  {
    slug: "pulseiras",
    name: "Pulseiras",
    products: [
      ["Pulseira Flower", 3090],
      ["Pulseira 7 Nós Vermelha de Proteção", 2000],
      ["Pulseira de Casal que Brilha no Escuro | Kit", 2000],
      ["Pulseira com Nó Único", 2090],
    ],
  },
  {
    slug: "tornozeleiras",
    name: "Tornozeleiras",
    products: [
      ["Tornozeleira Malibu", 1800],
      ["Tornozeleira Miçangas LGBTQIA+", 1500],
    ],
  },
  { slug: "aneis", name: "Anéis", products: [] },
  {
    slug: "flores-eternas",
    name: "Flores Eternas",
    products: [
      ["Buquê Unitário | Lírios", 11400],
      ["Buquê Artesanal Inspirado em Enrolados", 12500],
      ["Buquê Girassóis Van Gogh Artesanal", 12500],
      ["Flor Cartão Presente das Princesas", 3590],
      ["Luminária Flor Mágica", 14990],
    ],
  },
  {
    slug: "acessorios",
    name: "Acessórios",
    products: [["Kit Místico Elfos | Acessório Temático", 6090]],
  },
  {
    slug: "decoracao",
    name: "Decoração",
    products: [["Incensário Proteção", 6000]],
  },
];

const PLACEHOLDER_SLUGS = [
  "bracelete-das-fadas",
  "bracelete-micanga-colorida",
  "colar-flor-de-fio",
  "anel-borboleta",
  "guia-de-protecao",
  "buque-girassol-eterno",
  "buque-lirio-eterno",
];

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  await prisma.product.deleteMany({
    where: { slug: { in: PLACEHOLDER_SLUGS } },
  });

  for (const category of CATALOG) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { slug: category.slug, name: category.name },
    });

    for (const [name, priceCents] of category.products) {
      const data = { name, priceCents, categoryId: created.id };
      await prisma.product.upsert({
        where: { slug: slugify(name) },
        update: data,
        create: { ...data, slug: slugify(name), description: "" },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
