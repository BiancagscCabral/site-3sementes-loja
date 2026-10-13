import "dotenv/config";
import { cotarFrete, freteConfigurado } from "../src/lib/superfrete";
import { embalagemDaCategoria } from "../src/lib/embalagem";

// Testa a cotação direto pelo terminal, sem precisar abrir o site.
// Uso:  npm run frete:testar -- 01001000 braceletes 2
//       npm run frete:testar            (usa os exemplos abaixo)

const CEPS_EXEMPLO = [
  ["01001000", "São Paulo - SP"],
  ["20040002", "Rio de Janeiro - RJ"],
  ["69005040", "Manaus - AM"],
];

async function main() {
  if (!freteConfigurado()) {
    console.log(
      "Frete ainda não configurado. Preencha SUPERFRETE_TOKEN e STORE_ORIGIN_ZIPCODE no .env.",
    );
    return;
  }

  console.log(
    `Ambiente: ${process.env.SUPERFRETE_ENV}  |  origem: ${process.env.STORE_ORIGIN_ZIPCODE}\n`,
  );

  const [cepArg, categoria = "braceletes", qtd = "1"] = process.argv.slice(2);
  const destinos = cepArg ? [[cepArg, "informado"]] : CEPS_EXEMPLO;
  const itens = [
    {
      embalagem: embalagemDaCategoria(categoria),
      quantidade: Number(qtd) || 1,
    },
  ];

  for (const [cep, nome] of destinos) {
    try {
      const opcoes = await cotarFrete(cep, itens);
      console.log(`${cep} (${nome}):`);
      if (opcoes.length === 0) console.log("  nenhuma opção retornada");
      for (const o of opcoes) {
        const preco = (o.precoCents / 100).toFixed(2).replace(".", ",");
        console.log(`  ${o.nome.padEnd(14)} R$ ${preco.padStart(7)}   ${o.prazoDias} dia(s)`);
      }
    } catch (erro) {
      console.log(`${cep} (${nome}): ${(erro as Error).message}`);
    }
    console.log();
  }
}

main();
