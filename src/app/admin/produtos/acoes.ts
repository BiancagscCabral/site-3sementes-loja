"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  criarClienteServidor,
  ehAdmin,
  usuarioAtual,
} from "@/lib/supabase/servidor";
import {
  BUCKET_FOTOS,
  caminhoDaFotoEnviada,
  caminhoDentroDoBucket,
  extensaoAceita,
  urlPublicaDaFoto,
} from "@/lib/storage";

// Fotos dos produtos pelo painel.
//
// A subida acontece com a SESSÃO de quem está logada, não com a chave mestra
// do Supabase: quem decide se a escrita vale é uma regra no próprio Storage,
// que só libera os e-mails administradores. Por isso a chave secreta não
// precisa existir na Vercel.
//
// Ainda assim conferimos aqui também. A regra do Storage é a tranca; esta
// checagem é a porta, e serve para devolver um erro em português em vez de um
// erro cru do Supabase.

const TAMANHO_MAXIMO = 10 * 1024 * 1024;

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

type Resultado = { ok: true } | { ok: false; erro: string };

async function exigirAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario || !ehAdmin(usuario.email)) {
    throw new Error("Sem permissão.");
  }
}

export async function subirFotoDoProduto(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  await exigirAdmin();

  const slug = String(dados.get("slug") ?? "");
  const arquivo = dados.get("foto");
  const opcaoEscolhida = String(dados.get("opcao") ?? "");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Escolha uma foto." };
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    const mb = (arquivo.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      erro: `A foto tem ${mb} MB e o limite é 10 MB. Reduza e tente de novo.`,
    };
  }

  const extensao = extensaoAceita(arquivo.name);
  if (!extensao) {
    return {
      ok: false,
      erro: "Formato não aceito. Use JPG, PNG, WebP ou AVIF.",
    };
  }

  const produto = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, name: true, colors: true },
  });
  if (!produto) return { ok: false, erro: "Produto não encontrado." };

  // Opção em branco significa foto da galeria geral, o que é válido.
  const opcao = opcaoEscolhida && produto.colors.includes(opcaoEscolhida)
    ? opcaoEscolhida
    : null;
  if (opcaoEscolhida && !opcao) {
    return { ok: false, erro: "Essa opção não existe neste produto." };
  }

  const caminho = caminhoDaFotoEnviada(slug, arquivo.name);
  const supabase = await criarClienteServidor();

  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(caminho, arquivo, {
      contentType: TIPOS[extensao],
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { ok: false, erro: `O Supabase recusou a foto: ${error.message}` };
  }

  // A foto entra no fim da galeria do produto.
  const ultima = await prisma.productImage.findFirst({
    where: { productId: produto.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.productImage.create({
    data: {
      productId: produto.id,
      url: urlPublicaDaFoto(caminho),
      altText: opcao ? `${produto.name} — ${opcao}` : produto.name,
      optionName: opcao,
      position: (ultima?.position ?? -1) + 1,
    },
  });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${slug}`);
  revalidatePath(`/produtos/${slug}`);
  revalidatePath("/");

  return { ok: true };
}

export async function excluirFotoDoProduto(id: string): Promise<Resultado> {
  await exigirAdmin();

  const foto = await prisma.productImage.findUnique({
    where: { id },
    select: { url: true, product: { select: { slug: true } } },
  });
  if (!foto) return { ok: false, erro: "Foto não encontrada." };

  // Tira do banco primeiro: é o que o site lê. Se a remoção do arquivo
  // falhar, sobra um arquivo esquecido no bucket, que não quebra nada e dá
  // para limpar depois. O contrário deixaria o site apontando para o vazio.
  await prisma.productImage.delete({ where: { id } });

  const caminho = caminhoDentroDoBucket(foto.url);
  if (caminho) {
    const supabase = await criarClienteServidor();
    await supabase.storage.from(BUCKET_FOTOS).remove([caminho]);
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${foto.product.slug}`);
  revalidatePath(`/produtos/${foto.product.slug}`);
  revalidatePath("/");

  return { ok: true };
}
