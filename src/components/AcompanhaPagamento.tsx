"use client";

import { useSyncExternalStore } from "react";
import AtualizaSozinho from "@/components/AtualizaSozinho";

// Fica na página do pedido enquanto o pagamento não foi confirmado: recarrega
// os dados a cada poucos segundos (assim a página vira "Pagamento confirmado"
// sozinha, sem a cliente apertar nada) e oferece reabrir a aba do pagamento,
// caso ela tenha sido fechada. O endereço do pagamento vem do checkout, que o
// guarda só neste navegador.
export default function AcompanhaPagamento({ codigo }: { codigo: string }) {
  // Lido do navegador sem causar diferença na primeira renderização.
  const urlDoPagamento = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(`pagamento:${codigo}`);
      } catch {
        return null;
      }
    },
    () => null,
  );

  return (
    <div className="mt-6 rounded-2xl bg-sun/40 px-5 py-4">
      <AtualizaSozinho segundos={4} />
      <p className="flex items-center gap-3 text-[14px] font-medium text-foreground">
        <span
          aria-hidden
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        Esperando a confirmação do pagamento. Esta página muda sozinha.
      </p>
      {urlDoPagamento && (
        <a
          href={urlDoPagamento}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Abrir o pagamento de novo
        </a>
      )}
    </div>
  );
}
