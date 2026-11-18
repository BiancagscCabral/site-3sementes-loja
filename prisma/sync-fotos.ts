import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { posix } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugifyOption } from "../src/lib/catalog";
import { BUCKET_FOTOS, urlPublicaDaFoto } from "../src/lib/storage";

// Sobe as fotos de public/img/products para o Supabase Storage e liga cada uma
// ao produto do banco.
//
// Nome do arquivo = slug do produto; "-2", "-3" viram fotos extras.
// "slug__opcao.jpg" liga a foto a uma opção do produto (ex: o tema "Cinderela"),
// e aí a foto troca sozinha quando o cliente escolhe essa opção.
// Subpastas valem como organização (products/flores/buque-enrolados.jpg): só o
// nome do arquivo precisa bater com o slug. A mesma subpasta é mantida dentro
// do bucket.
//
// A pasta local virou área de preparo: o que vale é o que está no Storage.
// Rode com: npm run fotos

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FOLDER = "public/img/products";
const EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

// Caminhos relativos a FOLDER, incluindo o que estiver dentro de subpastas.
function listarFotos(dir = ""): string[] {
  return readdirSync(posix.join(FOLDER, dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const caminho = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return listarFotos(caminho);
      return EXTENSIONS.test(entry.name) ? [caminho] : [];
    },
  );
}

// A chave secreta só existe aqui, na sua máquina: ela ignora as regras de
// acesso do banco, então nunca vai para o navegador nem para a Vercel.
// É a que o Supabase antes chamava de service_role.
function clienteDoStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SECRET_KEY;

  if (!url || !chave) {
    throw new Error(
      "Faltou SUPABASE_SECRET_KEY no .env.\n" +
        "Pegue em: Supabase > Project Settings > API Keys > Secret keys > default.\n" +
        "Cole no .env como SUPABASE_SECRET_KEY=sb_secret_... (o .env não vai para o GitHub).",
    );
  }

  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Storage = ReturnType<typeof clienteDoStorage>["storage"];

// Cria o bucket na primeira vez. Público para leitura: a foto de um produto à
// venda não é segredo, e assim o <Image> busca direto, sem link assinado.
async function garantirBucket(storage: Storage) {
  const { data } = await storage.getBucket(BUCKET_FOTOS);
  if (data) return false;

  const { error } = await storage.createBucket(BUCKET_FOTOS, { public: true });
  if (error) throw new Error(`Não deu para criar o bucket: ${error.message}`);
  return true;
}

// O list() do Supabase mostra uma pasta por vez, então descemos nas subpastas.
// Devolve caminho -> tamanho, para reconhecer o que já está lá em cima.
async function listarNoBucket(
  storage: Storage,
  prefixo = "",
): Promise<Map<string, number>> {
  const { data, error } = await storage
    .from(BUCKET_FOTOS)
    .list(prefixo, { limit: 1000 });

  if (error) throw new Error(`Não deu para listar o bucket: ${error.message}`);

  const encontrados = new Map<string, number>();

  for (const item of data ?? []) {
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;

    // Pasta: o Supabase devolve a entrada sem id.
    if (!item.id) {
      for (const [sub, tamanho] of await listarNoBucket(storage, caminho)) {
        encontrados.set(sub, tamanho);
      }
      continue;
    }

    encontrados.set(caminho, Number(item.metadata?.size ?? -1));
  }

  return encontrados;
}

// Sobe o que ainda não está lá, ou mudou de tamanho. Reenviar as 54 a cada
// execução funcionaria, mas demora à toa e gasta banda da sua internet.
async function subirFotos(storage: Storage, arquivos: string[]) {
  const jaNoBucket = await listarNoBucket(storage);
  let enviadas = 0;
  let mantidas = 0;

  for (const arquivo of arquivos) {
    const corpo = readFileSync(posix.join(FOLDER, arquivo));
    const tamanhoLa = jaNoBucket.get(arquivo);

    if (tamanhoLa === corpo.byteLength) {
      mantidas += 1;
      continue;
    }

    const extensao = arquivo.split(".").pop()?.toLowerCase() ?? "";
    const { error } = await storage.from(BUCKET_FOTOS).upload(arquivo, corpo, {
      contentType: TIPOS[extensao] ?? "application/octet-stream",
      cacheControl: "3600",
      upsert: true,
    });

    if (error) throw new Error(`${arquivo}: ${error.message}`);

    console.log(`  subiu ${arquivo}`);
    enviadas += 1;
  }

  return { enviadas, mantidas };
}

// O sufixo do arquivo pode ser o nome inteiro da opção ou só o começo dele:
// "__enrolados" acha "Enrolados (Rapunzel)".
function acharOpcao(sufixo: string, opcoes: string[]) {
  const exata = opcoes.find((opcao) => slugifyOption(opcao) === sufixo);
  if (exata) return { opcao: exata };

  const comecam = opcoes.filter((opcao) =>
    slugifyOption(opcao).startsWith(sufixo),
  );
  if (comecam.length === 1) return { opcao: comecam[0] };
  return { erro: comecam.length > 1 ? "ambiguo" : "nao-existe" };
}

type Foto = { file: string; position: number; optionName: string | null };

async function main() {
  const files = listarFotos();

  const { storage } = clienteDoStorage();
  if (await garantirBucket(storage)) {
    console.log(`Bucket "${BUCKET_FOTOS}" criado.\n`);
  }

  const { enviadas, mantidas } = await subirFotos(storage, files);
  console.log(
    `${enviadas} foto(s) enviadas, ${mantidas} já estavam no Storage.\n`,
  );

  const produtos = await prisma.product.findMany({
    select: { slug: true, colors: true },
  });
  const slugsExistentes = new Set(produtos.map((p) => p.slug));
  const opcoesPorSlug = new Map(produtos.map((p) => [p.slug, p.colors]));

  const bySlug = new Map<string, Foto[]>();
  const orphans: string[] = [];
  const avisos: string[] = [];

  for (const file of files) {
    const nome = posix.basename(file).replace(EXTENSIONS, "");
    const [semOpcao, sufixoOpcao] = nome.split("__");

    // Produtos como "bracelete-oxum-01" têm número no próprio nome, então o
    // nome inteiro é testado antes de tratar o sufixo como número da foto.
    const match = semOpcao.match(/^(.*?)-(\d+)$/);
    const temSufixo = match && !slugsExistentes.has(semOpcao);
    const slug = temSufixo ? match[1] : semOpcao;
    const position = temSufixo ? Number(match[2]) : 1;

    let optionName: string | null = null;
    if (sufixoOpcao) {
      const opcoes = opcoesPorSlug.get(slug) ?? [];
      const resultado = acharOpcao(sufixoOpcao, opcoes);
      if (resultado.opcao) {
        optionName = resultado.opcao;
      } else {
        avisos.push(
          resultado.erro === "ambiguo"
            ? `${file}: "${sufixoOpcao}" serve para mais de uma opção de ${slug}`
            : `${file}: ${slug} não tem opção que comece com "${sufixoOpcao}"`,
        );
      }
    }

    const list = bySlug.get(slug) ?? [];
    list.push({ file, position, optionName });
    bySlug.set(slug, list);
  }

  let linked = 0;

  for (const [slug, images] of bySlug) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      orphans.push(`${slug} (${images.map((i) => i.file).join(", ")})`);
      continue;
    }

    // Fotos sem opção vêm primeiro; as de opção seguem a ordem dos botões.
    const ordemDaOpcao = (foto: Foto) =>
      foto.optionName ? product.colors.indexOf(foto.optionName) + 1 : 0;

    images.sort(
      (a, b) =>
        ordemDaOpcao(a) - ordemDaOpcao(b) || a.position - b.position,
    );

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: images.map((image, index) => ({
        productId: product.id,
        url: urlPublicaDaFoto(image.file),
        altText: image.optionName
          ? `${product.name} — ${image.optionName}`
          : product.name,
        optionName: image.optionName,
        position: index,
      })),
    });

    linked += images.length;
    const comOpcao = images.filter((i) => i.optionName).length;
    console.log(
      `${product.name}: ${images.length} foto(s)` +
        (comOpcao ? ` (${comOpcao} ligada(s) a uma opção)` : ""),
    );
  }

  console.log(`\n${linked} foto(s) ligadas a ${bySlug.size - orphans.length} produto(s).`);

  if (orphans.length) {
    console.log("\nArquivos sem produto correspondente:");
    for (const orphan of orphans) console.log(`  - ${orphan}`);
  }

  if (avisos.length) {
    console.log("\nFotos cuja opção não foi reconhecida (entraram na galeria sem ligação):");
    for (const aviso of avisos) console.log(`  - ${aviso}`);
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
