import type { Etapa } from "@/lib/andamento-do-pedido";

// A trilha do pedido, de recebido a entregue.
//
// Desenhada com a bolinha e a linha em elementos próprios, e não com borda de
// lista, para a linha poder parar na última bolinha em vez de escorrer até o
// fim do bloco.

export default function AndamentoDoPedido({ etapas }: { etapas: Etapa[] }) {
  return (
    <ol className="mt-8">
      {etapas.map((etapa, indice) => {
        const ultima = indice === etapas.length - 1;
        const feita = etapa.estado === "feita";
        const atual = etapa.estado === "atual";

        return (
          <li key={etapa.nome} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  feita
                    ? "border-primary bg-primary"
                    : atual
                      ? "border-primary bg-background"
                      : "border-border bg-background"
                }`}
              >
                {feita && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    className="h-3 w-3 text-background"
                  >
                    <path
                      d="m5 13 4 4 10-10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {atual && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>

              {!ultima && (
                <span
                  aria-hidden
                  className={`w-0.5 flex-1 ${feita ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>

            <div className={ultima ? "pb-0" : "pb-6"}>
              <p
                className={`text-[15px] leading-5 ${
                  atual
                    ? "font-semibold text-foreground"
                    : feita
                      ? "font-medium text-foreground"
                      : "text-muted"
                }`}
              >
                {etapa.nome}
              </p>
              {atual && (
                <p className="mt-1.5 text-[14px] leading-6 text-muted">
                  {etapa.agora}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
