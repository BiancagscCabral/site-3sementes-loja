import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Cadastra as medidas da embalagem em todos os produtos de uma vez, para não
// ter que abrir um por um no painel.
//
// Só mexe nas DIMENSÕES. O peso continua em branco de propósito: as caixas
// foram medidas, mas nada foi pesado ainda, e preencher um peso chutado aqui
// faria o painel parar de avisar que o peso é estimativa.
//
// Rode primeiro sem nada para ver o que ele faria:
//     npm run medidas
// E depois, se concordar:
//     npm run medidas -- --aplicar

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Caixa = { alturaCm: number; larguraCm: number; comprimentoCm: number };

// Medidas que a Bianca mediu nas caixas reais, em 19/11/2026.
const CAIXA_BRACELETE: Caixa = { alturaCm: 12, larguraCm: 12, comprimentoCm: 19 };
const CAIXA_PEQUENA: Caixa = { alturaCm: 3, larguraCm: 11, comprimentoCm: 16 };
const CAIXA_BUQUE: Caixa = { alturaCm: 11, larguraCm: 23, comprimentoCm: 31 };
const CAIXA_FLOR_CARTAO: Caixa = { alturaCm: 11, larguraCm: 15, comprimentoCm: 24 };

type Regra = {
  caixa: Caixa;
  medida: boolean; // false = deduzida por semelhança, não medida
  categorias?: string[];
  produtos?: string[];
  nota: string;
};

const REGRAS: Regra[] = [
  {
    caixa: CAIXA_BRACELETE,
    medida: true,
    categorias: ["braceletes"],
    nota: "caixa do bracelete, medida",
  },
  {
    caixa: CAIXA_PEQUENA,
    medida: true,
    categorias: ["guias", "colares"],
    nota: "caixa de guias e colares, medida",
  },
  {
    caixa: CAIXA_PEQUENA,
    medida: false,
    categorias: ["pulseiras", "tornozeleiras", "aneis"],
    nota: "deduzida: mesma miçanga de guias e colares",
  },
  {
    caixa: CAIXA_BUQUE,
    medida: true,
    produtos: [
      "buque-enrolados",
      "buque-girassois-van-gogh",
      "buque-unitario-lirios",
      // A Bianca confirmou que a luminária cabe na caixa de buquê grande.
      "luminaria-flor-magica",
    ],
    nota: "caixa do buquê, medida",
  },
  {
    caixa: CAIXA_FLOR_CARTAO,
    medida: true,
    produtos: ["flor-cartao-presente-das-princesas"],
    nota: "caixa da flor cartão, medida",
  },
];

// Estes não entram: são objetos de formato próprio e ninguém mediu a caixa
// deles. Ficam no padrão da categoria até você medir e cadastrar no painel.
const DE_FORA = [
  "incensario-protecao",
  "kit-mistico-elfos-acessorio-tematico",
];

function iguais(a: Caixa, b: Partial<Caixa>) {
  return (
    a.alturaCm === b.alturaCm &&
    a.larguraCm === b.larguraCm &&
    a.comprimentoCm === b.comprimentoCm
  );
}

async function main() {
  const aplicar = process.argv.includes("--aplicar");

  const produtos = await prisma.product.findMany({
    select: {
      slug: true,
      name: true,
      heightCm: true,
      widthCm: true,
      lengthCm: true,
      weightGrams: true,
      category: { select: { slug: true } },
    },
    orderBy: [{ category: { slug: "asc" } }, { name: "asc" }],
  });

  let vaoMudar = 0;
  let jaCertos = 0;
  const foraDeRegra: string[] = [];

  for (const produto of produtos) {
    if (DE_FORA.includes(produto.slug)) {
      foraDeRegra.push(`${produto.name} (deixado de fora de propósito)`);
      continue;
    }

    const regra = REGRAS.find(
      (r) =>
        r.produtos?.includes(produto.slug) ||
        r.categorias?.includes(produto.category.slug),
    );

    if (!regra) {
      foraDeRegra.push(`${produto.name} (nenhuma regra cobre "${produto.category.slug}")`);
      continue;
    }

    const atual = {
      alturaCm: produto.heightCm ?? undefined,
      larguraCm: produto.widthCm ?? undefined,
      comprimentoCm: produto.lengthCm ?? undefined,
    };

    if (iguais(regra.caixa, atual)) {
      jaCertos += 1;
      continue;
    }

    const { alturaCm, larguraCm, comprimentoCm } = regra.caixa;
    console.log(
      `${produto.name.padEnd(46)} ${alturaCm}x${larguraCm}x${comprimentoCm} cm` +
        `  (${regra.nota})`,
    );
    vaoMudar += 1;

    if (aplicar) {
      await prisma.product.update({
        where: { slug: produto.slug },
        data: {
          heightCm: alturaCm,
          widthCm: larguraCm,
          lengthCm: comprimentoCm,
        },
      });
    }
  }

  console.log("");
  console.log(`${vaoMudar} produto(s) ${aplicar ? "atualizados" : "seriam atualizados"}.`);
  if (jaCertos) console.log(`${jaCertos} já estavam com essa medida.`);

  if (foraDeRegra.length) {
    console.log("\nSem medida cadastrada, seguem no padrão da categoria:");
    for (const item of foraDeRegra) console.log(`  - ${item}`);
  }

  const semPeso = produtos.filter((p) => p.weightGrams === null).length;
  if (semPeso) {
    console.log(
      `\n${semPeso} produto(s) ainda sem peso cadastrado. As caixas foram` +
        " medidas, mas nada foi pesado:\no peso segue vindo da estimativa por" +
        " categoria. Entre 1 g e 300 g na mesma caixa o preço não muda, então" +
        "\no que importa é saber de que lado dos 300 g cada peça está.",
    );
  }

  if (!aplicar) {
    console.log("\nIsto foi só uma previsão. Para gravar de verdade:");
    console.log("    npm run medidas -- --aplicar");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error(erro);
    await prisma.$disconnect();
    process.exit(1);
  });
