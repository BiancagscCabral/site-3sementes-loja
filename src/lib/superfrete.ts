import type { Embalagem } from "@/lib/embalagem";

// Cotação de frete no SuperFrete. Só é chamado do servidor, para o token não
// chegar ao navegador.
// Documentação: https://superfrete.readme.io/reference/calculator

const SANDBOX = "https://sandbox.superfrete.com";
const PRODUCAO = "https://api.superfrete.com";

// PAC (1), SEDEX (2) e Mini Envios (17).
const SERVICOS = "1,2,17";

// O SuperFrete exige identificar a aplicação e um contato técnico.
const USER_AGENT = "Loja 3sementes (biancagsccabral@gmail.com)";

export type ItemParaFrete = { embalagem: Embalagem; quantidade: number };

export type OpcaoFrete = {
  id: number;
  nome: string;
  empresa: string;
  precoCents: number;
  prazoDias: number;
};

type RespostaServico = {
  id: number;
  name: string;
  price?: string | number;
  delivery_time?: number;
  company?: { name?: string };
  has_error?: boolean;
  error?: string;
};

function soNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

// Enquanto o token e o CEP de origem forem os exemplos do .env, o site continua
// funcionando: o checkout só não mostra as opções de frete.
export function freteConfigurado() {
  const token = process.env.SUPERFRETE_TOKEN ?? "";
  const cep = soNumeros(process.env.STORE_ORIGIN_ZIPCODE ?? "");
  const tokenValido = token.length > 20 && !/^(seu|sua|cole|troque)/i.test(token);
  const cepValido = cep.length === 8 && cep !== "00000000";
  return tokenValido && cepValido;
}

export class ErroDeFrete extends Error {}

export async function cotarFrete(
  cepDestino: string,
  itens: ItemParaFrete[],
): Promise<OpcaoFrete[]> {
  const cep = soNumeros(cepDestino);
  if (cep.length !== 8) throw new ErroDeFrete("CEP de destino inválido.");
  if (itens.length === 0) throw new ErroDeFrete("Nenhum item para calcular.");
  if (!freteConfigurado()) {
    throw new ErroDeFrete("Cálculo de frete ainda não configurado.");
  }

  // Qualquer coisa diferente de produção cai no sandbox: na dúvida, é melhor
  // cotar no ambiente de teste do que gastar saldo real.
  const ambiente = (process.env.SUPERFRETE_ENV ?? "").trim().toLowerCase();
  const ehProducao = ["producao", "produção", "production", "prod"].includes(
    ambiente,
  );
  const base = ehProducao ? PRODUCAO : SANDBOX;

  // Mandando os produtos um a um, o SuperFrete devolve a caixa ideal para o
  // conjunto em vez de somarmos as caixas na mão.
  const produtos = itens.map((item) => ({
    quantity: item.quantidade,
    height: item.embalagem.alturaCm,
    width: item.embalagem.larguraCm,
    length: item.embalagem.comprimentoCm,
    weight: item.embalagem.pesoGramas / 1000, // a API usa kg
  }));

  const resposta = await fetch(`${base}/api/v0/calculator`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPERFRETE_TOKEN}`,
      "Content-Type": "application/json",
      accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      from: { postal_code: soNumeros(process.env.STORE_ORIGIN_ZIPCODE ?? "") },
      to: { postal_code: cep },
      services: SERVICOS,
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false,
      },
      products: produtos,
    }),
    cache: "no-store",
  });

  if (!resposta.ok) {
    throw new ErroDeFrete(
      `SuperFrete respondeu ${resposta.status} ao calcular o frete.`,
    );
  }

  const dados: RespostaServico[] = await resposta.json();

  return dados
    .filter((servico) => !servico.has_error && servico.price != null)
    .map((servico) => ({
      id: servico.id,
      nome: servico.name,
      empresa: servico.company?.name ?? "",
      precoCents: Math.round(Number(servico.price) * 100),
      prazoDias: servico.delivery_time ?? 0,
    }))
    .filter((opcao) => opcao.precoCents > 0)
    .sort((a, b) => a.precoCents - b.precoCents);
}
