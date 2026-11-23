"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CampoDeBusca from "@/components/admin/CampoDeBusca";
import EmBreve from "@/components/admin/EmBreve";
import { IconeMais, IconePontos } from "@/components/Icones";

export type ProdutoDaGrade = {
  slug: string;
  nome: string;
  preco: string;
  categoria: string;
  categoriaSlug: string;
  foto: { url: string; alt: string } | null;
  totalDeFotos: number;
};

// Grade "Fotos dos produtos": busca, filtro por categoria e um cartão por
// produto. Cada cartão leva à tela do produto, onde as fotos são trocadas.
export default function GradeDeProdutos({
  produtos,
  categorias,
  categoriaInicial = "",
}: {
  produtos: ProdutoDaGrade[];
  categorias: { slug: string; nome: string }[];
  categoriaInicial?: string;
}) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState(categoriaInicial);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (categoria && p.categoriaSlug !== categoria) return false;
      return !termo || p.nome.toLowerCase().includes(termo);
    });
  }, [produtos, busca, categoria]);

  const semFoto = produtos.filter((p) => p.totalDeFotos === 0).length;

  return (
    <section className="mt-9">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-[26px] font-semibold text-primary">
            Fotos dos produtos
          </h2>
          <span className="text-[13px] text-muted">
            {produtos.length} produtos
            {semFoto > 0 && `, ${semFoto} sem foto`}
          </span>
        </div>
        <CampoDeBusca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Buscar produto..."
          rotulo="Buscar produto"
          className="sm:w-[300px]"
        />
      </div>

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {[{ slug: "", nome: "Todas" }, ...categorias].map((item) => {
          const ativa = categoria === item.slug;
          return (
            <button
              key={item.slug || "todas"}
              type="button"
              onClick={() => setCategoria(item.slug)}
              aria-pressed={ativa}
              className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                ativa
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-bg text-foreground hover:bg-secondary"
              }`}
            >
              {item.nome}
            </button>
          );
        })}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <li>
          <div
            aria-disabled
            className="flex h-full min-h-[200px] cursor-not-allowed flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 px-3 py-6 text-center text-[14px] text-foreground"
          >
            <IconeMais className="h-9 w-9 rounded-full border border-foreground p-1.5" />
            <span>
              Adicionar
              <br />
              novo produto
            </span>
            <EmBreve />
          </div>
        </li>

        {visiveis.map((produto) => (
          <li key={produto.slug}>
            <Link
              href={`/admin/produtos/${produto.slug}`}
              className="group block h-full overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-[0_6px_20px_rgba(73,53,46,0.12)]"
            >
              <span className="relative block aspect-[4/3] bg-muted-bg">
                {produto.foto ? (
                  <Image
                    src={produto.foto.url}
                    alt={produto.foto.alt}
                    fill
                    sizes="(min-width: 1280px) 220px, (min-width: 768px) 28vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[13px] text-muted">
                    sem foto
                  </span>
                )}
                {produto.totalDeFotos === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-sun px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                    sem foto
                  </span>
                )}
              </span>

              <span className="flex items-start justify-between gap-2 px-3.5 py-3">
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-[14px] font-semibold leading-snug text-foreground">
                    {produto.nome}
                  </span>
                  <span className="mt-1 block text-[14px] font-bold text-primary">
                    {produto.preco}
                  </span>
                </span>
                <IconePontos className="mt-1 h-4 w-4 shrink-0 text-foreground" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {visiveis.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          Nenhum produto encontrado com esse filtro.
        </p>
      )}
    </section>
  );
}
