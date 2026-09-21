"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, itemKey } from "@/lib/cart";
import { formatPriceCents } from "@/lib/format";
import { getCategoryBrand } from "@/lib/catalog";

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-4 w-4"
    >
      <path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13" strokeLinejoin="round" />
    </svg>
  );
}

export default function CarrinhoPage() {
  const { items, itemCount, totalCents, ready, setQuantity, removeItem } =
    useCart();

  if (!ready) {
    return <div className="mx-auto max-w-5xl px-6 py-16" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-medium text-foreground">
        Sua sacola
      </h1>

      {items.length === 0 ? (
        <div className="mt-6">
          <p className="text-sm text-muted">
            Sua sacola está vazia por enquanto.
          </p>
          <Link
            href="/#categorias"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Ver categorias
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_300px]">
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const key = itemKey(item);
              const brand = getCategoryBrand(item.categorySlug);
              return (
                <li
                  key={key}
                  className={`${brand.themeClass} rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40`}
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/produtos/${item.slug}`}
                      className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background sm:h-20 sm:w-20"
                    >
                      <Image
                        src={brand.logo}
                        alt=""
                        width={40}
                        height={40}
                        className={brand.markClass}
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/produtos/${item.slug}`}
                            className="block text-[15px] font-medium leading-snug text-foreground hover:underline"
                          >
                            {item.name}
                          </Link>
                          {item.variantName && (
                            <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                              {item.variantName}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-[15px] font-semibold text-foreground">
                          {formatPriceCents(item.priceCents * item.quantity)}
                        </span>
                      </div>

                      <span className="mt-1 text-[13px] text-muted">
                        {formatPriceCents(item.priceCents)} cada
                      </span>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => setQuantity(key, item.quantity - 1)}
                            aria-label="Diminuir quantidade"
                            className="flex h-8 w-8 items-center justify-center rounded-l-full text-muted transition-colors hover:bg-background hover:text-foreground"
                          >
                            &minus;
                          </button>
                          <span className="w-7 text-center text-[13px] font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(key, item.quantity + 1)}
                            aria-label="Aumentar quantidade"
                            className="flex h-8 w-8 items-center justify-center rounded-r-full text-muted transition-colors hover:bg-background hover:text-foreground"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(key)}
                          aria-label={`Remover ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger/10"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-medium text-foreground">
              Resumo
            </h2>

            <div className="mt-4 flex items-baseline justify-between text-[13px]">
              <span className="text-muted">
                {itemCount === 1 ? "1 peça" : `${itemCount} peças`}
              </span>
              <span className="text-lg font-semibold text-foreground">
                {formatPriceCents(totalCents)}
              </span>
            </div>

            <p className="mt-3 border-t border-border pt-3 text-[13px] leading-6 text-muted">
              O frete é combinado com a gente pelo WhatsApp, junto com a forma
              de pagamento.
            </p>

            <Link
              href="/checkout"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Fechar pedido
            </Link>

            <Link
              href="/#categorias"
              className="mt-3 block text-center text-[13px] text-muted transition-colors hover:text-foreground"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
