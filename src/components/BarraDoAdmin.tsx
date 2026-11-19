"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sair from "@/components/Sair";

const ESTILO_LINK =
  "cursor-pointer whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.06em] text-foreground transition-colors hover:text-accent";

// Barra do topo do painel. No lugar do cabeçalho da loja, traz o que se usa
// aqui: pedidos, o botão que leva aos produtos para adicionar fotos, e o Sair.
// Sem login de administrador, mostra só a marca.
export default function BarraDoAdmin({ logado }: { logado: boolean }) {
  const caminho = usePathname();
  const emPedidos = caminho === "/admin";
  const emProdutos = caminho.startsWith("/admin/produtos");

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3 sm:px-6 sm:py-3.5">
        <Link
          href={logado ? "/admin" : "/"}
          className="flex shrink-0 items-baseline gap-2.5"
        >
          <span className="font-display text-[24px] font-bold leading-none tracking-tight text-foreground sm:text-[28px]">
            3sementes
          </span>
          <span className="text-[10px] font-bold uppercase leading-none tracking-[0.3em] text-accent sm:text-[11px]">
            painel
          </span>
        </Link>

        {logado && (
          <>
            <div className="order-3 flex w-full items-center gap-5 sm:order-2 sm:ml-4 sm:w-auto">
              <Link
                href="/admin"
                aria-current={emPedidos ? "page" : undefined}
                className={`${ESTILO_LINK} ${
                  emPedidos
                    ? "underline decoration-accent decoration-2 underline-offset-[10px]"
                    : ""
                }`}
              >
                Pedidos
              </Link>

              <Link
                href="/admin/produtos"
                aria-current={emProdutos ? "page" : undefined}
                className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg bg-accent px-5 text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90 sm:flex-none"
              >
                Adicionar fotos de produtos
              </Link>
            </div>

            <div className="order-2 ml-auto sm:order-3">
              <Sair className={ESTILO_LINK} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
