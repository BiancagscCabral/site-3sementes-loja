"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Sair from "@/components/Sair";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProdutoDoSelect = {
  slug: string;
  nome: string;
  categoria: string;
  temFoto: boolean;
};

const VER_TODOS = "__todos";

const ESTILO_LINK =
  "cursor-pointer whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.06em] text-foreground transition-colors hover:text-accent";

// Barra do topo do painel. No lugar do cabeçalho da loja, traz o que se usa
// aqui: pedidos, um seletor com todos os produtos para ir direto às fotos, e
// o Sair. Sem login de administrador, mostra só a marca.
export default function BarraDoAdmin({
  logado,
  produtos,
}: {
  logado: boolean;
  produtos: ProdutoDoSelect[];
}) {
  const router = useRouter();
  const caminho = usePathname();

  // Agrupa por categoria mantendo a ordem em que a lista já chegou.
  const porCategoria = new Map<string, ProdutoDoSelect[]>();
  for (const produto of produtos) {
    const lista = porCategoria.get(produto.categoria) ?? [];
    lista.push(produto);
    porCategoria.set(produto.categoria, lista);
  }

  const escolher = (valor: string) => {
    router.push(
      valor === VER_TODOS ? "/admin/produtos" : `/admin/produtos/${valor}`,
    );
  };

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
                aria-current={caminho === "/admin" ? "page" : undefined}
                className={`${ESTILO_LINK} ${
                  caminho === "/admin"
                    ? "underline decoration-accent decoration-2 underline-offset-[10px]"
                    : ""
                }`}
              >
                Pedidos
              </Link>

              <Select value="" onValueChange={escolher}>
                <SelectTrigger
                  aria-label="Adicionar fotos de produtos"
                  className="min-w-0 flex-1 justify-between sm:w-[270px] sm:flex-none"
                >
                  <SelectValue placeholder="Adicionar fotos de produtos" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  collisionPadding={12}
                  className="max-h-[min(var(--radix-select-content-available-height),440px)] w-[min(92vw,340px)]"
                >
                  <SelectGroup>
                    <SelectItem value={VER_TODOS}>
                      Ver todos os produtos
                    </SelectItem>
                  </SelectGroup>

                  {[...porCategoria].map(([categoria, lista]) => (
                    <SelectGroup key={categoria}>
                      <SelectLabel className="mt-1.5 border-t border-border pt-2.5">
                        {categoria}
                      </SelectLabel>
                      {lista.map((produto) => (
                        <SelectItem key={produto.slug} value={produto.slug}>
                          <span className="leading-snug">
                            {produto.nome}
                            {!produto.temFoto && (
                              <span className="ml-1.5 text-[11px] font-normal text-muted">
                                · sem foto
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
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
