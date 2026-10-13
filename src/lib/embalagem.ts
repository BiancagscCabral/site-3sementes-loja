// Medidas padrão da embalagem por categoria, usadas quando o produto ainda não
// tem peso e dimensões próprios cadastrados. Em cm e gramas.
//
// ATENÇÃO: são estimativas para o cálculo funcionar. Pese e meça as embalagens
// reais e cadastre nos produtos — frete cobrado a menos sai do seu bolso.
export type Embalagem = {
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  pesoGramas: number;
};

// Mínimo aceito pelos Correios para encomenda: 16 x 11 x 2 cm.
const JOIA: Embalagem = {
  alturaCm: 2,
  larguraCm: 11,
  comprimentoCm: 16,
  pesoGramas: 100,
};

const BUQUE: Embalagem = {
  alturaCm: 15,
  larguraCm: 20,
  comprimentoCm: 30,
  pesoGramas: 400,
};

const DECORACAO: Embalagem = {
  alturaCm: 20,
  larguraCm: 20,
  comprimentoCm: 25,
  pesoGramas: 600,
};

const POR_CATEGORIA: Record<string, Embalagem> = {
  guias: JOIA,
  braceletes: JOIA,
  colares: JOIA,
  pulseiras: JOIA,
  tornozeleiras: JOIA,
  aneis: JOIA,
  acessorios: JOIA,
  "flores-eternas": BUQUE,
  decoracao: DECORACAO,
};

export function embalagemDaCategoria(slug: string): Embalagem {
  return POR_CATEGORIA[slug] ?? JOIA;
}
