// Monta link de WhatsApp a partir do telefone que a cliente digitou.
//
// O telefone é gravado exatamente como ela escreveu, e cada uma escreve de um
// jeito: "(81) 99116-3657", "81991163657", "+55 81 99116-3657". Grudar "55" na
// frente dos dígitos só funciona para quem NÃO escreveu o código do país; para
// quem escreveu, vira 555581..., que não é número de ninguém e abre o WhatsApp
// num contato inexistente.
//
// Por isso aqui a conta é outra: pega os últimos 11 dígitos, que são DDD mais
// o número, e põe o 55 na frente. Funciona com as duas formas.

export function numeroParaWhatsApp(telefone: string | null | undefined) {
  if (!telefone) return null;

  const digitos = telefone.replace(/\D/g, "");

  // 10 é fixo antigo com DDD, 11 é celular com DDD. Menos que isso não dá
  // para adivinhar, e um link errado é pior que link nenhum.
  if (digitos.length < 10) return null;

  return `55${digitos.slice(-11)}`;
}

export function linkDoWhatsApp(
  telefone: string | null | undefined,
  mensagem?: string,
) {
  const numero = numeroParaWhatsApp(telefone);
  if (!numero) return null;

  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${numero}${texto}`;
}

// Primeiro nome, para a mensagem não começar com o nome completo do cadastro.
function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? "";
}

// A mensagem já vai escrita para você não ter que lembrar o código do pedido
// nem explicar quem é. É só abrir e completar.
export function mensagemSobreOPedido(nome: string, codigo: string) {
  return (
    `Oi, ${primeiroNome(nome)}! Aqui é a 3sementes. ` +
    `Estou falando sobre o seu pedido ${codigo}.`
  );
}
