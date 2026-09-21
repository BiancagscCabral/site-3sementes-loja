import "dotenv/config";
import { readdirSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Liga as fotos de public/img/products aos produtos do banco.
// Nome do arquivo = slug do produto; "-2", "-3" viram fotos extras.
// Rode com: npm run fotos

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FOLDER = "public/img/products";
const EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

async function main() {
  const files = readdirSync(FOLDER).filter((file) => EXTENSIONS.test(file));

  const bySlug = new Map<string, { file: string; position: number }[]>();
  const orphans: string[] = [];

  for (const file of files) {
    const base = file.replace(EXTENSIONS, "");
    const match = base.match(/^(.*?)(?:-(\d+))?$/);
    const slug = match?.[1] ?? base;
    const position = match?.[2] ? Number(match[2]) : 1;
    const list = bySlug.get(slug) ?? [];
    list.push({ file, position });
    bySlug.set(slug, list);
  }

  let linked = 0;

  for (const [slug, images] of bySlug) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      orphans.push(`${slug} (${images.map((i) => i.file).join(", ")})`);
      continue;
    }

    images.sort((a, b) => a.position - b.position);

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: images.map((image, index) => ({
        productId: product.id,
        url: `/img/products/${image.file}`,
        altText: product.name,
        position: index,
      })),
    });

    linked += images.length;
    console.log(`${product.name}: ${images.length} foto(s)`);
  }

  console.log(`\n${linked} foto(s) ligadas a ${bySlug.size - orphans.length} produto(s).`);

  if (orphans.length) {
    console.log("\nArquivos sem produto correspondente:");
    for (const orphan of orphans) console.log(`  - ${orphan}`);
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
