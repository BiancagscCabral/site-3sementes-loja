"use client";

import { useEffect, useMemo, useState } from "react";
import BotaoAdicionar from "@/components/BotaoAdicionar";
import ProductCard from "@/components/ProductCard";
import {
  chaveDaCor,
  hexDaCor,
  opcaoEhCor,
  rotuloDaCor,
} from "@/components/coresDosProdutos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProdutoDaLista = {
  slug: string;
  name: string;
  priceCents: number;
  colors: string[];
  sizes: string[];
  optionLabel: string | null;
  image: { url: string; altText: string | null } | null;
  categoriaSlug: string;
};

type Ordem = "destaques" | "menor" | "maior" | "nome";

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "destaques", rotulo: "Destaques" },
  { valor: "menor", rotulo: "Menor preço" },
  { valor: "maior", rotulo: "Maior preço" },
  { valor: "nome", rotulo: "Nome (A a Z)" },
];

const reais = (centavos: number) =>
  `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;

function IconeFiltro({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 5h18l-7 8v6l-4-2v-4z" />
    </svg>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-5 first:pt-0 last:border-b-0">
      <h2 className="text-[17px] font-semibold text-foreground">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ListaDaCategoria({
  produtos,
  categoriaAtual,
  irmas,
}: {
  produtos: ProdutoDaLista[];
  categoriaAtual: string;
  /** Categorias do mesmo grupo (inclui a atual), com nome e quantidade. */
  irmas: { slug: string; name: string; total: number }[];
}) {
  const precos = produtos.map((p) => p.priceCents);
  const minReais = Math.floor(Math.min(...precos) / 500) * 5;
  const maxReais = Math.ceil(Math.max(...precos) / 500) * 5;
  const temFaixa = produtos.length > 0 && maxReais > minReais;

  const [categorias, setCategorias] = useState<string[]>([categoriaAtual]);
  const [cores, setCores] = useState<string[]>([]);
  const [faixa, setFaixa] = useState<[number, number]>([minReais, maxReais]);
  const [ordem, setOrdem] = useState<Ordem>("destaques");
  const [painelAberto, setPainelAberto] = useState(false);

  useEffect(() => {
    if (!painelAberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setPainelAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [painelAberto]);

  // Cores que existem nas categorias marcadas (só opção do tipo cor).
  const opcoesDeCor = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const p of produtos) {
      if (!categorias.includes(p.categoriaSlug) || !opcaoEhCor(p.optionLabel))
        continue;
      for (const chave of new Set(p.colors.map(chaveDaCor))) {
        contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
      }
    }
    return [...contagem.entries()]
      .filter(([chave]) => hexDaCor(chave))
      .sort((a, b) => b[1] - a[1]);
  }, [produtos, categorias]);

  const lista = useMemo(() => {
    const filtrados = produtos.filter(
      (p) =>
        categorias.includes(p.categoriaSlug) &&
        p.priceCents >= faixa[0] * 100 &&
        p.priceCents <= faixa[1] * 100 &&
        (cores.length === 0 ||
          (opcaoEhCor(p.optionLabel) &&
            p.colors.some((c) => cores.includes(chaveDaCor(c))))),
    );
    if (ordem === "menor")
      return [...filtrados].sort((a, b) => a.priceCents - b.priceCents);
    if (ordem === "maior")
      return [...filtrados].sort((a, b) => b.priceCents - a.priceCents);
    if (ordem === "nome")
      return [...filtrados].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );
    return filtrados;
  }, [produtos, categorias, cores, faixa, ordem]);

  const filtrosAtivos =
    (categorias.length === 1 && categorias[0] === categoriaAtual ? 0 : 1) +
    (cores.length > 0 ? 1 : 0) +
    (faixa[0] !== minReais || faixa[1] !== maxReais ? 1 : 0);

  const limpar = () => {
    setCategorias([categoriaAtual]);
    setCores([]);
    setFaixa([minReais, maxReais]);
  };

  const alternar = (lista: string[], item: string) =>
    lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item];

  const filtros = (
    <>
      {irmas.length > 1 && (
        <Grupo titulo="Categoria">
          <ul className="flex flex-col gap-3">
            {irmas.map((c) => (
              <li key={c.slug}>
                <label className="flex cursor-pointer items-center gap-3 text-[15px] text-foreground">
                  <input
                    type="checkbox"
                    checked={categorias.includes(c.slug)}
                    onChange={() => {
                      const proximas = alternar(categorias, c.slug);
                      // Sempre fica ao menos uma categoria marcada.
                      if (proximas.length > 0) setCategorias(proximas);
                    }}
                    className="h-[18px] w-[18px] cursor-pointer accent-primary"
                  />
                  <span>
                    {c.name} <span className="text-muted">({c.total})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Grupo>
      )}

      {opcoesDeCor.length > 1 && (
        <Grupo titulo="Cor">
          <ul className="flex flex-wrap gap-2.5">
            {opcoesDeCor.map(([chave]) => {
              const ligada = cores.includes(chave);
              return (
                <li key={chave}>
                  <button
                    type="button"
                    onClick={() => setCores(alternar(cores, chave))}
                    aria-pressed={ligada}
                    aria-label={rotuloDaCor(chave)}
                    title={rotuloDaCor(chave)}
                    style={{ backgroundColor: hexDaCor(chave) ?? undefined }}
                    className={`h-8 w-8 cursor-pointer rounded-full border border-foreground/25 transition-shadow ${
                      ligada
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:ring-2 hover:ring-border"
                    }`}
                  />
                </li>
              );
            })}
          </ul>
        </Grupo>
      )}

      {temFaixa && (
        <Grupo titulo="Faixa de preço">
          <div className="faixa-preco">
            <div className="faixa-trilho" />
            <div
              className="faixa-selecao"
              style={{
                left: `${((faixa[0] - minReais) / (maxReais - minReais)) * 100}%`,
                right: `${100 - ((faixa[1] - minReais) / (maxReais - minReais)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={minReais}
              max={maxReais}
              step={5}
              value={faixa[0]}
              aria-label="Preço mínimo"
              onChange={(e) =>
                setFaixa([
                  Math.min(Number(e.target.value), faixa[1] - 5),
                  faixa[1],
                ])
              }
            />
            <input
              type="range"
              min={minReais}
              max={maxReais}
              step={5}
              value={faixa[1]}
              aria-label="Preço máximo"
              onChange={(e) =>
                setFaixa([
                  faixa[0],
                  Math.max(Number(e.target.value), faixa[0] + 5),
                ])
              }
            />
          </div>
          <p className="mt-3 text-[14px] text-muted">
            {reais(faixa[0] * 100)} - {reais(faixa[1] * 100)}
          </p>
        </Grupo>
      )}

      {filtrosAtivos > 0 && (
        <button
          type="button"
          onClick={limpar}
          className="mt-4 cursor-pointer text-[14px] font-medium text-primary underline underline-offset-4"
        >
          Limpar filtros
        </button>
      )}
    </>
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <p className="text-[15px] text-foreground" aria-live="polite">
          {lista.length} produto{lista.length === 1 ? "" : "s"}
        </p>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPainelAberto(true)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-primary px-5 text-[14px] font-semibold text-primary transition-colors hover:bg-secondary lg:hidden"
          >
            <IconeFiltro className="h-4 w-4" />
            Filtrar
            {filtrosAtivos > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">
                {filtrosAtivos}
              </span>
            )}
          </button>

          <Select
            value={ordem}
            onValueChange={(valor) => setOrdem(valor as Ordem)}
          >
            <SelectTrigger
              aria-label="Ordenar por"
              className="h-10 gap-2 rounded-full bg-background px-4 text-[14px]"
            >
              <span className="hidden text-muted sm:inline">Ordenar por:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {ORDENS.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>
                  {o.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filtros">
          <p className="mb-5 text-[19px] font-semibold text-foreground">
            Filtrar por
          </p>
          {filtros}
        </aside>

        <div>
          {lista.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center">
              <p className="text-[16px] font-semibold text-foreground">
                Nenhuma peça com esses filtros.
              </p>
              <button
                type="button"
                onClick={limpar}
                className="mt-3 cursor-pointer text-[14px] font-medium text-primary underline underline-offset-4"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {lista.map((p) => (
                <li key={p.slug}>
                  <ProductCard
                    slug={p.slug}
                    name={p.name}
                    priceCents={p.priceCents}
                    image={p.image}
                    colors={p.colors}
                    optionLabel={p.optionLabel}
                    sizes="(max-width: 640px) 50vw, 240px"
                    acao={
                      <BotaoAdicionar
                        slug={p.slug}
                        name={p.name}
                        priceCents={p.priceCents}
                        categorySlug={p.categoriaSlug}
                        image={p.image?.url}
                        temOpcoes={p.colors.length > 0 || p.sizes.length > 0}
                      />
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {painelAberto && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
        >
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setPainelAberto(false)}
            className="absolute inset-0 cursor-pointer bg-foreground/45"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background px-5 pb-6 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[19px] font-semibold text-foreground">
                Filtrar por
              </p>
              <button
                type="button"
                onClick={() => setPainelAberto(false)}
                className="cursor-pointer text-[14px] font-medium text-muted underline underline-offset-4"
              >
                Fechar
              </button>
            </div>
            {filtros}
            <button
              type="button"
              onClick={() => setPainelAberto(false)}
              className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
            >
              Ver {lista.length} produto{lista.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
