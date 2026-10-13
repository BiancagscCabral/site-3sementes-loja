import { readdirSync } from "node:fs";
import { join } from "node:path";

export type HeroMedia = { url: string; tipo: "imagem" | "video" };

const PASTA = join(process.cwd(), "public", "img", "hero");
const IMAGENS = /\.(jpe?g|png|webp|avif)$/i;
const VIDEOS = /\.(mp4|webm)$/i;

// Lê o que estiver em public/img/hero. É só jogar as fotos e os vídeos lá:
// nenhuma alteração de código é necessária para trocar o fundo do topo.
export function listarMidiaDoHero(): HeroMedia[] {
  let arquivos: string[];
  try {
    arquivos = readdirSync(PASTA);
  } catch {
    return []; // pasta ainda não existe: o topo fica na cor sólida
  }

  return arquivos
    .filter((arquivo) => IMAGENS.test(arquivo) || VIDEOS.test(arquivo))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map((arquivo) => ({
      url: `/img/hero/${arquivo}`,
      tipo: VIDEOS.test(arquivo) ? "video" : "imagem",
    }));
}
