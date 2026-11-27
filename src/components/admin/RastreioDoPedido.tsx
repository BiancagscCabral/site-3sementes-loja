"use client";

import { useState, useTransition } from "react";
import { salvarRastreio } from "@/app/admin/acoes";

// Campo para colar o rastreio depois de postar.
//
// Aceita as duas formas sem reclamar: o código solto dos Correios ou o link
// que a SuperFrete devolve quando a etiqueta é postada. Obrigar um formato só
// faria você ter que achar o código dentro do link.
export default function RastreioDoPedido({
  id,
  atual,
}: {
  id: string;
  atual: string | null;
}) {
  const [valor, setValor] = useState(atual ?? "");
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  const mudou = valor.trim() !== (atual ?? "").trim();

  const salvar = () => {
    setErro(null);
    setSalvo(false);
    iniciar(async () => {
      try {
        await salvarRastreio(id, valor);
        setSalvo(true);
      } catch {
        setErro("Não deu para salvar.");
      }
    });
  };

  return (
    <div className="mt-4 border-t border-border pt-3">
      <label
        htmlFor={`rastreio-${id}`}
        className="block text-[13px] font-medium text-foreground"
      >
        Rastreio
      </label>
      <p className="mt-1 text-[12px] leading-[1.6] text-muted">
        Cole o código dos Correios ou o link que a SuperFrete dá na postagem.
        A cliente passa a ver um botão de acompanhar a entrega.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          id={`rastreio-${id}`}
          value={valor}
          onChange={(evento) => {
            setValor(evento.target.value);
            setSalvo(false);
          }}
          placeholder="DG048745602BR ou https://..."
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-[13px] outline-none transition-colors hover:border-foreground focus-visible:border-accent"
        />
        <button
          type="button"
          onClick={salvar}
          disabled={salvando || !mudou}
          className="h-10 shrink-0 cursor-pointer rounded-lg bg-accent px-4 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {erro && <p className="mt-1.5 text-[12px] text-danger">{erro}</p>}
      {salvo && !mudou && (
        <p className="mt-1.5 text-[12px] text-muted">Rastreio salvo.</p>
      )}
    </div>
  );
}
