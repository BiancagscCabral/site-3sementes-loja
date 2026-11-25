"use client";

import { useMemo, useState } from "react";
import AcoesDoPedido from "@/components/AcoesDoPedido";
import CampoDeBusca from "@/components/admin/CampoDeBusca";
import { IconeSetaBaixo } from "@/components/Icones";
import { SITUACOES, situacao } from "@/components/admin/statusDoPedido";
import { linkDoWhatsApp, mensagemSobreOPedido } from "@/lib/telefone";

export type PedidoDaLista = {
  id: string;
  codigo: string;
  status: string;
  foiPago: boolean;
  expirou: boolean;
  data: string;
  valor: string;
  cliente: string;
  telefone: string;
  email: string | null;
  endereco: string[];
  itens: string[];
  entrega: string;
};

// Lista de pedidos: abas por situação, busca e linhas que abrem para mostrar
// os detalhes e as ações. Os dados chegam prontos do servidor.
export default function ListaDePedidos({
  pedidos,
}: {
  pedidos: PedidoDaLista[];
}) {
  const [aba, setAba] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const contagem = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of pedidos) mapa.set(p.status, (mapa.get(p.status) ?? 0) + 1);
    return mapa;
  }, [pedidos]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (aba !== "TODOS" && p.status !== aba) return false;
      if (!termo) return true;
      return [p.codigo, p.cliente, p.telefone, p.email ?? "", ...p.itens]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });
  }, [pedidos, aba, busca]);

  const abas = [
    { valor: "TODOS", nome: "Todos", total: pedidos.length },
    ...SITUACOES.map((s) => ({
      valor: s.valor as string,
      nome: s.nome as string,
      total: contagem.get(s.valor) ?? 0,
    })),
  ];

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Situação do pedido"
          className="-mx-1 flex max-w-full gap-1 overflow-x-auto border-b border-border px-1"
        >
          {abas.map((item) => {
            const ativa = aba === item.valor;
            return (
              <button
                key={item.valor}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => setAba(item.valor)}
                className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                  ativa
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground hover:text-primary"
                }`}
              >
                {item.nome} ({item.total})
              </button>
            );
          })}
        </div>
        <CampoDeBusca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Buscar pedido, cliente ou produto..."
          rotulo="Buscar pedido"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          {pedidos.length === 0
            ? "Nenhum pedido ainda. Quando alguém finalizar uma compra no site, ele aparece aqui na hora."
            : "Nenhum pedido encontrado com esse filtro."}
        </p>
      ) : (
        <div className="mt-5">
          <div
            aria-hidden
            className="hidden grid-cols-[1fr_1.6fr_1.1fr_1fr_1.8fr_28px] gap-3 rounded-xl bg-muted-bg px-5 py-3 text-[13px] font-bold text-foreground md:grid"
          >
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Data</span>
            <span>Valor</span>
            <span>Status</span>
            <span />
          </div>

          <ul className="md:mt-1">
            {visiveis.map((pedido) => {
              const estado = situacao(pedido.status);
              const nomeDoEstado = pedido.expirou
                ? "Pagamento abandonado"
                : estado.nome;
              const aberta = aberto === pedido.id;
              return (
                <li key={pedido.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setAberto(aberta ? null : pedido.id)}
                    aria-expanded={aberta}
                    className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-2 py-3.5 text-left transition-colors hover:bg-muted-bg/50 md:grid-cols-[1fr_1.6fr_1.1fr_1fr_1.8fr_28px] md:px-5"
                  >
                    <span className="font-display text-[15px] font-semibold text-foreground">
                      {pedido.codigo}
                    </span>
                    <span className="col-start-1 row-start-2 text-[14px] text-foreground md:col-start-auto md:row-start-auto">
                      {pedido.cliente}
                    </span>
                    <span className="col-start-1 row-start-3 text-[13px] text-muted md:col-start-auto md:row-start-auto md:text-[14px] md:text-foreground">
                      {pedido.data}
                    </span>
                    <span className="col-start-2 row-start-2 text-right text-[14px] font-semibold text-foreground md:col-start-auto md:row-start-auto md:text-left">
                      {pedido.valor}
                    </span>
                    <span className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-1.5 justify-self-end md:col-start-auto md:row-start-auto md:justify-start md:justify-self-start">
                      {/* Duas etiquetas porque são duas coisas diferentes: se o
                          dinheiro entrou, e em que pé está o preparo. Confundir
                          as duas já deu problema: dá para marcar "Em produção"
                          na mão sem ninguém ter pago. */}
                      {pedido.foiPago &&
                        (pedido.status === "AWAITING_PAYMENT" ? (
                          // Entrou dinheiro, mas menos que o total: o pedido
                          // fica retido de propósito. Dizer "confirmado" aqui
                          // faria a peça sair antes de a conta fechar.
                          <span className="inline-block rounded-full bg-rose/45 px-2.5 py-1 text-[11px] font-semibold text-primary-dark">
                            Conferir pagamento
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-[#cfe6c9] px-2.5 py-1 text-[11px] font-semibold text-[#2f5a2a]">
                            Pagamento confirmado
                          </span>
                        ))}
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${
                          pedido.expirou
                            ? "bg-muted-bg text-muted"
                            : estado.chip
                        }`}
                      >
                        {nomeDoEstado}
                      </span>
                    </span>
                    <IconeSetaBaixo
                      className={`hidden h-4 w-4 text-foreground transition-transform md:block ${
                        aberta ? "rotate-180" : "-rotate-90"
                      }`}
                    />
                  </button>

                  {aberta && (
                    <div className="mx-2 mb-4 rounded-2xl bg-surface px-5 py-4 md:mx-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="text-[13px] leading-6 text-muted">
                          <span className="block text-[14px] font-semibold text-foreground">
                            {pedido.cliente}
                          </span>
                          <ContatoNoWhatsApp
                            telefone={pedido.telefone}
                            nome={pedido.cliente}
                            codigo={pedido.codigo}
                          />
                          {pedido.email && (
                            <span className="block">{pedido.email}</span>
                          )}
                          <span className="mt-1.5 block">
                            {pedido.endereco.map((linha, i) => (
                              <span key={i} className="block">
                                {linha}
                              </span>
                            ))}
                          </span>
                        </div>

                        <div className="text-[13px] leading-6 text-muted">
                          <ul>
                            {pedido.itens.map((linha, i) => (
                              <li key={i}>{linha}</li>
                            ))}
                          </ul>
                          <span className="mt-1.5 block">{pedido.entrega}</span>
                        </div>
                      </div>

                      <AcoesDoPedido
                        id={pedido.id}
                        status={pedido.status}
                        codigo={pedido.codigo}
                        foiPago={pedido.foiPago}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// O telefone vira um atalho para a conversa, com a mensagem já escrita e o
// código do pedido dentro. Telefone que não dá para montar aparece como texto
// simples: link quebrado abre um contato que não existe, e isso é pior do que
// copiar o número na mão.
function ContatoNoWhatsApp({
  telefone,
  nome,
  codigo,
}: {
  telefone: string;
  nome: string;
  codigo: string;
}) {
  const link = linkDoWhatsApp(telefone, mensagemSobreOPedido(nome, codigo));

  if (!link) {
    return (
      <span className="block">
        {telefone}{" "}
        <span className="text-[12px]">(número incompleto)</span>
      </span>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-primary"
    >
      {telefone}
      <span className="text-[12px] no-underline">falar no WhatsApp</span>
    </a>
  );
}
