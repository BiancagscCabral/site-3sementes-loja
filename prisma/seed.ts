import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Braceletes", slug: "braceletes" },
  { name: "Colares", slug: "colares" },
  { name: "Anéis", slug: "aneis" },
  { name: "Guias", slug: "guias" },
  { name: "Flores Eternas", slug: "flores-eternas" },
];

const PRODUCTS: Record<
  string,
  { name: string; slug: string; description: string; priceCents: number }[]
> = {
  braceletes: [
    {
      name: "Bracelete das Fadas",
      slug: "bracelete-das-fadas",
      description: "Fio dourado trançado com miçangas coloridas.",
      priceCents: 4900,
    },
    {
      name: "Bracelete Miçanga Colorida",
      slug: "bracelete-micanga-colorida",
      description: "Miçangas artesanais em tons vibrantes.",
      priceCents: 3900,
    },
  ],
  colares: [
    {
      name: "Colar Flor de Fio",
      slug: "colar-flor-de-fio",
      description: "Colar em fio dourado com pingente floral.",
      priceCents: 5900,
    },
  ],
  aneis: [
    {
      name: "Anel Borboleta",
      slug: "anel-borboleta",
      description: "Anel ajustável em fio dourado com borboleta.",
      priceCents: 2900,
    },
  ],
  guias: [
    {
      name: "Guia de Proteção",
      slug: "guia-de-protecao",
      description: "Guia artesanal para uso religioso.",
      priceCents: 6900,
    },
  ],
  "flores-eternas": [
    {
      name: "Buquê Girassol Eterno",
      slug: "buque-girassol-eterno",
      description:
        "Flores de chenille em tons de amarelo e azul, embrulhado à mão.",
      priceCents: 7900,
    },
    {
      name: "Buquê Lírio Eterno",
      slug: "buque-lirio-eterno",
      description: "Flores de chenille inspiradas em lírios, nunca murcham.",
      priceCents: 8900,
    },
  ],
};

async function main() {
  for (const category of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });

    for (const product of PRODUCTS[category.slug] ?? []) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: { ...product, categoryId: created.id },
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
