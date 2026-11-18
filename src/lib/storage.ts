// Onde as fotos dos produtos moram.
//
// Antes elas viviam dentro do repositório, em public/img/products, e cada foto
// nova exigia abrir o VSCode, commitar e publicar o site de novo. Agora moram
// num bucket público do Supabase Storage, e o banco guarda o endereço delas.
//
// Guardamos a URL inteira em ProductImage.url, e não só o caminho do arquivo,
// porque assim o <Image> recebe o endereço pronto e nenhuma tela precisa saber
// de onde a foto vem. Se um dia trocarmos de provedor, é um script reescrevendo
// as linhas da tabela.

export const BUCKET_FOTOS = "produtos";

// O caminho dentro do bucket mantém a subpasta: "braceletes/bracelete-astro.jpg".
export function urlPublicaDaFoto(caminho: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não está definida.");
  }

  // Os nomes são slugs, mas encodar cada pedaço sai de graça e evita surpresa
  // no dia em que alguém salvar um arquivo com acento.
  const seguro = caminho.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET_FOTOS}/${seguro}`;
}

// Serve para reconhecer uma foto que já está no Storage, separando-a das
// antigas, que começam com "/img/products/".
export function ehFotoNoStorage(url: string) {
  return /^https?:\/\//.test(url);
}

// As fotos enviadas pelo painel moram numa pasta só delas dentro do bucket.
//
// Isso não é organização: é o que impede o "npm run fotos" de apagá-las. Ele
// reconstrói as fotos a partir da pasta local, e sem essa separação uma foto
// que você mandou do celular sumiria do site na próxima vez que alguém
// rodasse o comando.
export const PASTA_ENVIADAS = "enviadas";

export function ehFotoEnviadaPeloPainel(url: string) {
  return caminhoDentroDoBucket(url)?.startsWith(`${PASTA_ENVIADAS}/`) ?? false;
}

// De volta da URL para o caminho no bucket, que é o que a API de remoção pede.
// Devolve null se a URL não for deste bucket.
export function caminhoDentroDoBucket(url: string) {
  const marca = `/storage/v1/object/public/${BUCKET_FOTOS}/`;
  const corte = url.indexOf(marca);
  if (corte === -1) return null;
  return decodeURIComponent(url.slice(corte + marca.length));
}

const EXTENSOES_ACEITAS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export function extensaoAceita(nomeDoArquivo: string) {
  const extensao = nomeDoArquivo.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSOES_ACEITAS.has(extensao) ? extensao : null;
}

// Nome único e previsível para a foto que chega pelo painel. O horário na
// frente evita que duas fotos do mesmo produto briguem pelo mesmo nome, e
// manter o slug na pasta deixa o bucket legível por produto.
export function caminhoDaFotoEnviada(slug: string, nomeDoArquivo: string) {
  const extensao = extensaoAceita(nomeDoArquivo);
  if (!extensao) throw new Error(`Extensão não aceita: ${nomeDoArquivo}`);

  const agora = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);

  return `${PASTA_ENVIADAS}/${slug}/${agora}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extensao}`;
}
