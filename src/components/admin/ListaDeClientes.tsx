"use client";

import { useMemo, useState } from "react";
import CampoDeBusca from "@/components/admin/CampoDeBusca";
import { linkDoWhatsApp } from "@/lib/telefone";

export type ClienteDaLista = {
  chave: string;
  nome: string;
  email: string | null;
  telefone: string;
  pedidos: number;
  gasto: string;
  ultimoPedido: string;
};

// Lista de clientes (quem já fez pedido), com busca por nome, e-mail ou
// telefone. Telefone leva ao WhatsApp.
export default function ListaDeClientes({
  clientes,
}: {
  clientes: ClienteDaLista[];
}) {
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) =>
      [c.nome, c.email ?? "", c.telefone]
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [clientes, busca]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[14px] text-muted">
          {clientes.length} cliente{clientes.length === 1 ? "" : "s"}
        </span>
        <CampoDeBusca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Buscar nome, e-mail ou telefone..."
          rotulo="Buscar cliente"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          {clientes.length === 0
            ? "Nenhum cliente ainda. Quem fizer um pedido aparece aqui."
            : "Nenhum cliente encontrado com esse filtro."}
        </p>
      ) : (
        <div className="mt-4">
          <div
            aria-hidden
            className="hidden grid-cols-[1.6fr_1.8fr_1.2fr_0.7fr_1fr_1fr] gap-3 rounded-xl bg-muted-bg px-5 py-3 text-[13px] font-bold text-foreground md:grid"
          >
            <span>Cliente</span>
            <span>E-mail</span>
            <span>Telefone</span>
            <span>Pedidos</span>
            <span>Total pago</span>
            <span>Último pedido</span>
          </div>

          <ul className="md:mt-1">
            {visiveis.map((cliente) => (
              <li
                key={cliente.chave}
                className="grid grid-cols-2 gap-x-3 gap-y-1 border-b border-border px-2 py-3.5 text-[14px] md:grid-cols-[1.6fr_1.8fr_1.2fr_0.7fr_1fr_1fr] md:px-5"
              >
                <span className="col-span-2 font-semibold text-foreground md:col-span-1">
                  {cliente.nome}
                </span>
                <span className="col-span-2 break-all text-muted md:col-span-1 md:text-foreground">
                  {cliente.email ?? "sem e-mail"}
                </span>
                {linkDoWhatsApp(cliente.telefone) ? (
                  <a
                    href={linkDoWhatsApp(cliente.telefone) as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {cliente.telefone}
                  </a>
                ) : (
                  <span className="text-muted">{cliente.telefone}</span>
                )}
                <span className="text-right text-muted md:text-left md:text-foreground">
                  {cliente.pedidos} pedido{cliente.pedidos === 1 ? "" : "s"}
                </span>
                <span className="text-foreground">{cliente.gasto}</span>
                <span className="text-right text-muted md:text-left md:text-foreground">
                  {cliente.ultimoPedido}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
