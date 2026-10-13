import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join, posix } from "node:path";
import sharp from "sharp";

// Reduz as fotos grandes de public/img/products (e das subpastas dela) para no
// máximo 1600px de largura.
// Rode com: npm run fotos:otimizar

const FOLDER = "public/img/products";
const MAX_WIDTH = 1600;
const LIMITE_KB = 400;

// Caminhos relativos a FOLDER, incluindo o que estiver dentro de subpastas.
function listarFotos(dir = ""): string[] {
  return readdirSync(posix.join(FOLDER, dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const caminho = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return listarFotos(caminho);
      return /\.(jpe?g|png)$/i.test(entry.name) ? [caminho] : [];
    },
  );
}

async function main() {
  const files = listarFotos();
  let otimizadas = 0;

  for (const file of files) {
    const path = join(FOLDER, file);
    const antes = statSync(path).size;
    const metadata = await sharp(path).metadata();
    const precisaReduzir = (metadata.width ?? 0) > MAX_WIDTH;

    if (antes <= LIMITE_KB * 1024 && !precisaReduzir) continue;

    // A saída é sempre JPEG, então um PNG vira .jpg — senão o arquivo ficaria
    // com extensão mentindo sobre o conteúdo.
    const destino = path.replace(/\.png$/i, ".jpg");
    const temp = `${path}.tmp`;
    await sharp(path)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(temp);

    // Só vale trocar se a economia for real: recomprimir por 1KB a cada rodada
    // só perde qualidade.
    const depois = statSync(temp).size;
    if (depois > antes * 0.95) {
      unlinkSync(temp);
      continue;
    }

    unlinkSync(path);
    renameSync(temp, destino);
    otimizadas++;
    console.log(
      `${file}${destino !== path ? " -> .jpg" : ""}: ` +
        `${(antes / 1024).toFixed(0)}KB -> ${(depois / 1024).toFixed(0)}KB`,
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
