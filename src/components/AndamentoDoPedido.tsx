import type { Etapa } from "@/lib/andamento-do-pedido";

function quando(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

// A trilha do pedido, de recebido a entregue.
//
// Desenhada com a bolinha e a linha em elementos próprios, e não com borda de
// lista, para a linha poder parar na última bolinha em vez de escorrer até o
// fim do bloco.

// O rastreio pode vir das duas formas: o código solto dos Correios, ou o link
// que a SuperFrete devolve quando a etiqueta é postada. Link vira botão
// direto; código solto vira botão para a busca dos Correios, com o código
// visível ao lado para quem preferir copiar.
function enderecoDoRastreio(rastreio: string) {
  if (/^https?:\/\//i.test(rastreio.trim())) return rastreio.trim();
  const codigo = rastreio.trim().toUpperCase();
  return `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(codigo)}`;
}

function ehLink(rastreio: string) {
  return /^https?:\/\//i.test(rastreio.trim());
}

export default function AndamentoDoPedido({
  etapas,
  rastreio,
}: {
  etapas: Etapa[];
  rastreio?: string | null;
}) {
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
              {etapa.em && (
                <p className="mt-0.5 text-[13px] text-muted">
                  {quando(etapa.em)}
                </p>
              )}
              {atual && (
                <p className="mt-1.5 text-[14px] leading-6 text-muted">
                  {etapa.agora}
                </p>
              )}

              {/* Aparece desde que o pedido foi postado, e continua depois de
                  entregue: o histórico da entrega ainda interessa. */}
              {etapa.nome === "Postado" && (feita || atual) && rastreio && (
                <div className="mt-3">
                  <a
                    href={enderecoDoRastreio(rastreio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                  >
                    Acompanhar a entrega
                  </a>
                  {!ehLink(rastreio) && (
                    <p className="mt-2 text-[13px] text-muted">
                      Código: <strong>{rastreio.trim().toUpperCase()}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
