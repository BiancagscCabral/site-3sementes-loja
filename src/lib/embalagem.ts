// Medidas padrão da embalagem por categoria, usadas quando o produto ainda não
// tem peso e dimensões próprios cadastrados. Em cm e gramas.
//
// Errar para menos faz a loja cobrar frete abaixo do custo, e a diferença sai
// do bolso dela. Errar para muito espanta o pedido grande, que é o que mais
// interessa. O certo é cadastrar o valor real no painel, por produto.
export type Embalagem = {
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  pesoGramas: number;
};

// As MEDIDAS abaixo são as caixas reais, medidas pela Bianca em 19/11/2026.
// Os PESOS continuam sendo estimativa: ainda não foram pesados.
//
// Peso só muda o preço quando cruza uma faixa. Medido no SuperFrete para São
// Paulo, qualquer peso entre 1 g e 300 g na mesma caixa dá exatamente o mesmo
// valor. Por isso a conta aqui é: manter o peso no teto da faixa provável, que
// erra para mais e não para menos.

// Caixa achatada, 3 cm de altura: cabe no Mini Envios, que é a opção mais
// barata e exige até 300 g e cerca de 4 x 16 x 24 cm.
const CAIXA_PEQUENA: Embalagem = {
  alturaCm: 3,
  larguraCm: 11,
  comprimentoCm: 16,
  pesoGramas: 100,
};

// A caixa do bracelete é alta demais para o Mini Envios: com 12 cm de altura
// ela cai no PAC, que sai uns R$ 7 mais caro por pedido.
const CAIXA_BRACELETE: Embalagem = {
  alturaCm: 12,
  larguraCm: 12,
  comprimentoCm: 19,
  pesoGramas: 100,
};

const CAIXA_BUQUE: Embalagem = {
  alturaCm: 11,
  larguraCm: 23,
  comprimentoCm: 31,
  pesoGramas: 400,
};

const DECORACAO: Embalagem = {
  alturaCm: 20,
  larguraCm: 20,
  comprimentoCm: 25,
  pesoGramas: 600,
};

// Pulseiras, tornozeleiras, anéis e acessórios não foram medidos: usam a caixa
// pequena por serem do mesmo porte de guias e colares.
const POR_CATEGORIA: Record<string, Embalagem> = {
  guias: CAIXA_PEQUENA,
  colares: CAIXA_PEQUENA,
  pulseiras: CAIXA_PEQUENA,
  tornozeleiras: CAIXA_PEQUENA,
  aneis: CAIXA_PEQUENA,
  acessorios: CAIXA_PEQUENA,
  braceletes: CAIXA_BRACELETE,
  // A categoria tem dois tamanhos de caixa: o buquê e a flor cartão, que é
  // menor (11 x 15 x 24). O padrão fica no maior, que erra para mais; a flor
  // cartão tem medida própria cadastrada no painel.
  "flores-eternas": CAIXA_BUQUE,
  decoracao: DECORACAO,
};

export function embalagemDaCategoria(slug: string): Embalagem {
  return POR_CATEGORIA[slug] ?? CAIXA_PEQUENA;
}
