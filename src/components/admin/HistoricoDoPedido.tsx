import { situacao } from "@/components/admin/statusDoPedido";

// O que aconteceu com o pedido e quando.
//
// Serve para responder "desde quando está assim" e "quem mexeu nisso". O
// "sistema" é o pagamento confirmado sozinho; um e-mail é mudança feita no
// painel por alguém.

export type LinhaDoHistorico = {
  status: string;
  origem: string | null;
  createdAt: Date;
};

function quando(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export default function HistoricoDoPedido({
  linhas,
}: {
  linhas: LinhaDoHistorico[];
}) {
  if (linhas.length === 0) {
    return (
      <p className="mt-4 border-t border-border pt-3 text-[12px] text-muted">
        Sem histórico: este pedido é anterior ao registro de etapas.
      </p>
    );
  }

  // Mais recente em cima: é o que se quer saber primeiro.
  const ordenadas = [...linhas].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="text-[13px] font-medium text-foreground">Histórico</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {ordenadas.map((linha, indice) => (
          <li
            key={`${linha.status}-${indice}`}
            className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-muted"
          >
            <span className="font-medium text-foreground">
              {situacao(linha.status).nome}
            </span>
            <span>{quando(linha.createdAt)}</span>
            {linha.origem && linha.origem !== "sistema" && (
              <span>por {linha.origem}</span>
            )}
            {linha.origem === "sistema" && <span>automático</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
