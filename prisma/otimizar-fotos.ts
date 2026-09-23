import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// Reduz as fotos grandes de public/img/products para no máximo 1600px de largura.
// Rode com: npm run fotos:otimizar

const FOLDER = "public/img/products";
const MAX_WIDTH = 1600;
const LIMITE_KB = 400;

async function main() {
  const files = readdirSync(FOLDER).filter((file) => /\.(jpe?g|png)$/i.test(file));
  let otimizadas = 0;

  for (const file of files) {
    const path = join(FOLDER, file);
    const antes = statSync(path).size;
    const metadata = await sharp(path).metadata();
    const precisaReduzir = (metadata.width ?? 0) > MAX_WIDTH;

    if (antes <= LIMITE_KB * 1024 && !precisaReduzir) continue;

    const temp = `${path}.tmp`;
    await sharp(path)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(temp);

    const depois = statSync(temp).size;
    if (depois >= antes) {
      unlinkSync(temp);
      continue;
    }

    unlinkSync(path);
    renameSync(temp, path);
    otimizadas++;
    console.log(
      `${file}: ${(antes / 1024).toFixed(0)}KB -> ${(depois / 1024).toFixed(0)}KB`,
    );
  }

  console.log(
    otimizadas
      ? `\n${otimizadas} foto(s) otimizada(s).`
      : "\nNenhuma foto precisou de otimização.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
