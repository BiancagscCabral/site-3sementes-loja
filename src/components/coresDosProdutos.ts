// Cores dos produtos: o cadastro guarda o NOME da cor ("Dourado", "Azul 02") e
// a tela precisa de uma bolinha para mostrar. Este arquivo faz a ponte.

const HEX: Record<string, string> = {
  dourado: "#d6a62b",
  prata: "#c7c9cc",
  vermelho: "#d32f2f",
  azul: "#2f6fde",
  amarelo: "#f2c230",
  verde: "#3c9a4a",
  branco: "#ffffff",
  lilas: "#a97bd6",
  roxo: "#7b3fa0",
  rosa: "#e87ca0",
  "rosa claro": "#f4b6cb",
  laranja: "#f08a24",
  preto: "#222222",
  marrom: "#7a4b2a",
};

// "Azul 02" e "Azul 01" são a mesma cor para quem filtra: tira o número do fim
// e os acentos ("Lilás" vira "lilas").
export function chaveDaCor(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*\d+\s*$/, "")
    .trim()
    .toLowerCase();
}

export function hexDaCor(nome: string) {
  return HEX[chaveDaCor(nome)] ?? null;
}

// Nome para mostrar no filtro ("azul" -> "Azul").
export function rotuloDaCor(chave: string) {
  return chave.charAt(0).toUpperCase() + chave.slice(1);
}

// O rótulo da opção do produto: sem rótulo ou "Cor" é cor de verdade; qualquer
// outro ("Tema") é outra coisa e não entra em filtro nem ganha bolinha.
export function opcaoEhCor(rotulo?: string | null) {
  return !rotulo || rotulo.trim().toLowerCase() === "cor";
}
