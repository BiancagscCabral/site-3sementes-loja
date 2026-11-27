"use client";

import { useState, useTransition } from "react";
import {
  cancelarPedidoPelaCliente,
  pedirCancelamento,
} from "@/app/pedido/[code]/acoes";

// O botão de desistir, na página do pedido.
//
// Dois comportamentos, porque são duas situações diferentes. Antes de pagar,
// cancelar é só desistir, e acontece na hora. Depois de pagar, cancelar
// significa devolver dinheiro: a cliente avisa e a loja resolve, então aqui
// pedimos o motivo, que é o que a loja precisa saber para responder.
//
// Em ambos, a confirmação é em dois passos. Cancelar por engano um pedido que
// se quer é frustrante, e o caminho de volta é refazer tudo.
export default function CancelarPedido({
  codigo,
  modo,
}: {
  codigo: string;
  modo: "direto" | "pedido";
}) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [resultado, setResultado] = useState<
    { ok: true; mensagem: string } | { ok: false; erro: string } | null
  >(null);
  const [enviando, iniciar] = useTransition();

  const confirmar = () => {
    iniciar(async () => {
      const r =
        modo === "direto"
          ? await cancelarPedidoPelaCliente(codigo)
          : await pedirCancelamento(codigo, motivo);
      setResultado(r);
      if (r.ok) setAberto(false);
    });
  };

  if (resultado?.ok) {
    return (
      <p className="mt-6 rounded-2xl border border-border bg-surface px-5 py-4 text-[14px] leading-6 text-muted">
        {resultado.mensagem}
      </p>
    );
  }

  if (!aberto) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="cursor-pointer text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-danger"
        >
          {modo === "direto" ? "Cancelar este pedido" : "Quero cancelar"}
        </button>
        {resultado?.ok === false && (
          <p className="mt-2 text-[13px] text-danger">{resultado.erro}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
      {modo === "direto" ? (
        <p className="text-[14px] leading-6 text-foreground">
          Quer mesmo cancelar o pedido {codigo}? Isso não dá para desfazer, mas
          você pode fazer um novo quando quiser.
        </p>
      ) : (
        <>
          <p className="text-[14px] leading-6 text-foreground">
            Este pedido já está em andamento, então o cancelamento passa pela
            loja. A gente avisa ela agora e o contato vem pelo WhatsApp.
          </p>
          <label className="mt-3 block">
            <span className="text-[13px] text-muted">
              Conta rapidinho o motivo (opcional)
            </span>
            <textarea
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-[14px] outline-none transition-colors focus-visible:border-accent"
              placeholder="Mudei de ideia, pedi errado, achei que chegaria antes..."
            />
          </label>
        </>
      )}

      {resultado?.ok === false && (
        <p className="mt-3 text-[13px] text-danger">{resultado.erro}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={confirmar}
          disabled={enviando}
          className="inline-flex h-10 cursor-pointer items-center rounded-full border border-danger px-5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger hover:text-background disabled:opacity-60"
        >
          {enviando
            ? "Enviando..."
            : modo === "direto"
              ? "Sim, cancelar"
              : "Enviar pedido de cancelamento"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="cursor-pointer text-[13px] text-muted underline underline-offset-4"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
