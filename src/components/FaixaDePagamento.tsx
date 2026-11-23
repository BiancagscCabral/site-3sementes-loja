import Image from "next/image";

// Formas de pagamento aceitas, em logos de uma cor só (terracota), numa pílula
// creme. Os arquivos ficam em public/img/pagamento. `largura` e `altura` são o
// tamanho original do arquivo; a exibição é reduzida por CSS.
const FORMAS = [
  { arquivo: "visa", nome: "Visa", largura: 180, altura: 62 },
  { arquivo: "mastercard", nome: "Mastercard", largura: 134, altura: 87 },
  { arquivo: "pix", nome: "Pix", largura: 209, altura: 76 },
  { arquivo: "elo", nome: "Elo", largura: 124, altura: 65 },
  { arquivo: "hipercard", nome: "Hipercard", largura: 189, altura: 79 },
  { arquivo: "amex", nome: "American Express", largura: 180, altura: 65 },
  { arquivo: "diners", nome: "Diners Club", largura: 271, altura: 73 },
];

export default function FaixaDePagamento() {
  return (
    <section className="px-5 py-4 sm:px-6">
      <ul
        aria-label="Formas de pagamento"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-4 rounded-3xl bg-muted-bg px-6 py-5 sm:flex-nowrap sm:gap-x-0 sm:rounded-full sm:px-8"
      >
        {FORMAS.map((forma, indice) => (
          <li
            key={forma.arquivo}
            className={`flex items-center justify-center sm:flex-1 ${
              indice > 0 ? "sm:border-l sm:border-border" : ""
            }`}
          >
            <Image
              src={`/img/pagamento/${forma.arquivo}.png`}
              alt={forma.nome}
              width={forma.largura}
              height={forma.altura}
              className="h-auto w-[calc(var(--w)*0.34px)] sm:w-[calc(var(--w)*0.4px)]"
              style={{ "--w": forma.largura } as React.CSSProperties}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
