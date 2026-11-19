"use client";

import { useActionState } from "react";
import { salvarEmbalagem } from "@/app/admin/produtos/acoes";

type Medidas = {
  peso: number | null;
  altura: number | null;
  largura: number | null;
  comprimento: number | null;
};

export default function EmbalagemDoProduto({
  slug,
  categoria,
  produtosNaCategoria,
  atual,
  estimativa,
}: {
  slug: string;
  categoria: string;
  produtosNaCategoria: number;
  atual: Medidas;
  estimativa: Medidas;
}) {
  const [resultado, salvar, salvando] = useActionState(salvarEmbalagem, null);

  const cadastrado =
    atual.peso !== null ||
    atual.altura !== null ||
    atual.largura !== null ||
    atual.comprimento !== null;

  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        Embalagem para o frete
      </h2>

      <p className="mt-2 text-[13px] leading-[1.7] text-muted">
        Meça a caixa ou o envelope <strong>já com a peça dentro</strong>, do
        jeito que vai para o correio. Não é a medida da peça: é sobre a
        embalagem que os Correios cobram.
      </p>

      {!cadastrado && (
        <p className="mt-3 rounded-lg border border-border bg-muted-bg/60 px-3 py-2.5 text-[12px] leading-[1.6] text-muted">
          Hoje este produto usa uma <strong>estimativa</strong> de{" "}
          {estimativa.altura} × {estimativa.largura} × {estimativa.comprimento}{" "}
          cm e {estimativa.peso} g, que eu chutei para o cálculo funcionar. Se o
          real for maior, a diferença do frete sai do seu bolso em cada venda.
        </p>
      )}

      <form action={salvar} className="mt-4">
        <input type="hidden" name="slug" value={slug} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Campo
            nome="peso"
            rotulo="Peso"
            unidade="g"
            valor={atual.peso}
            dica={String(estimativa.peso)}
          />
          <Campo
            nome="altura"
            rotulo="Altura"
            unidade="cm"
            valor={atual.altura}
            dica={String(estimativa.altura)}
          />
          <Campo
            nome="largura"
            rotulo="Largura"
            unidade="cm"
            valor={atual.largura}
            dica={String(estimativa.largura)}
          />
          <Campo
            nome="comprimento"
            rotulo="Comprimento"
            unidade="cm"
            valor={atual.comprimento}
            dica={String(estimativa.comprimento)}
          />
        </div>

        {produtosNaCategoria > 1 && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13px]">
            <input
              type="checkbox"
              name="aplicarNaCategoria"
              className="mt-0.5 cursor-pointer accent-[var(--accent)]"
            />
            <span>
              Aplicar aos {produtosNaCategoria} produtos de {categoria}
              <span className="mt-0.5 block text-[12px] text-muted">
                Útil quando a categoria inteira vai na mesma embalagem. Isso
                sobrescreve o que já estiver cadastrado nos outros.
              </span>
            </span>
          </label>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar embalagem"}
          </button>

          {resultado?.ok === false && (
            <span className="text-[13px] text-danger">{resultado.erro}</span>
          )}
          {resultado?.ok === true && (
            <span className="text-[13px] text-muted">
              {resultado.aviso ?? "Salvo."}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function Campo({
  nome,
  rotulo,
  unidade,
  valor,
  dica,
}: {
  nome: string;
  rotulo: string;
  unidade: string;
  valor: number | null;
  dica: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium">
        {rotulo} <span className="font-normal text-muted">({unidade})</span>
      </span>
      <input
        name={nome}
        type="text"
        inputMode="decimal"
        defaultValue={valor ?? ""}
        placeholder={dica}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] outline-none transition-colors hover:border-foreground focus-visible:border-accent"
      />
    </label>
  );
}
