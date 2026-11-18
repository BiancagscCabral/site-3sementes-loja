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
