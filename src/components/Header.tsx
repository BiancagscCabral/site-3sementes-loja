"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, WHATSAPP_URL } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-6 w-6"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

function ChevronIcon({ aberto }: { aberto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      className={`h-3.5 w-3.5 transition-transform duration-200 ${
        aberto ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchForm({ autoFocusable = false }: { autoFocusable?: boolean }) {
  return (
    <form
      action="/busca"
      className="flex items-center gap-2 border border-border bg-surface px-3 py-2"
    >
      <button
        type="submit"
        aria-label="Buscar"
        className="shrink-0 text-muted transition-colors hover:text-foreground"
      >
        <SearchIcon />
      </button>
      <input
        type="search"
        name="q"
        autoFocus={autoFocusable}
        placeholder="bracelete, guia, buquê"
        className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted sm:w-[180px]"
      />
    </form>
  );
}

export default function Header() {
  const { itemCount, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriasAbertas, setCategoriasAbertas] = useState(false);
  const categoriasRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de categorias ao clicar fora dele ou apertar Esc.
  useEffect(() => {
    if (!categoriasAbertas) return;

    const aoClicar = (evento: MouseEvent) => {
      if (!categoriasRef.current?.contains(evento.target as Node)) {
        setCategoriasAbertas(false);
      }
    };
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setCategoriasAbertas(false);
    };

    document.addEventListener("mousedown", aoClicar);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicar);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [categoriasAbertas]);

  return (
    <div className="sticky top-0 z-10">
      <div className="bg-primary px-6 py-2.5 text-center text-[13px] text-primary-foreground">
        Feito em Pernambuco &middot; Enviamos para todo o Brasil
      </div>

      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-4 sm:px-6 sm:py-5">
          <Link href="/" className="flex shrink-0 items-baseline gap-2.5">
            <span className="font-display text-[26px] font-bold leading-none tracking-tight text-foreground sm:text-[30px]">
              3sementes
            </span>
            <span className="text-[10px] font-bold uppercase leading-none tracking-[0.3em] text-accent sm:text-[11px]">
              store
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold uppercase tracking-[0.06em] lg:ml-8 lg:flex">
            <div ref={categoriasRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoriasAbertas((aberto) => !aberto)}
                aria-expanded={categoriasAbertas}
                aria-haspopup="true"
                className="flex items-center gap-1.5 uppercase tracking-[0.06em] hover:text-accent"
              >
                Categorias
                <ChevronIcon aberto={categoriasAbertas} />
              </button>

              {categoriasAbertas && (
                <div
                  onClick={() => setCategoriasAbertas(false)}
                  className="absolute left-0 top-[calc(100%+14px)] z-20 w-[380px] border border-border bg-surface p-2 shadow-lg"
                >
                  <div className="grid grid-cols-2">
                    {CATEGORIES.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categorias/${category.slug}`}
                        className="px-3 py-2.5 text-[13px] font-medium normal-case tracking-normal text-foreground transition-colors hover:bg-muted-bg hover:text-accent"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/#sobre" className="hover:text-accent">
              Sobre a 3sementes
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-4 sm:gap-[18px]">
            <div className="hidden sm:block">
              <SearchForm />
            </div>
            <Link
              href="/carrinho"
              className="text-[13px] font-bold text-foreground hover:text-accent"
            >
              Sacola{ready && itemCount > 0 ? ` (${itemCount})` : " (0)"}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="lg:hidden"
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-surface px-5 py-5 lg:hidden">
            <div className="sm:hidden">
              <SearchForm autoFocusable />
            </div>

            <nav
              onClick={() => setMenuOpen(false)}
              className="mt-4 flex flex-col"
            >
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorias/${category.slug}`}
                  className="border-b border-border py-3 text-[15px] text-foreground"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div
              onClick={() => setMenuOpen(false)}
              className="mt-4 flex flex-col gap-3 text-sm text-muted"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Falar no WhatsApp
              </a>
              <Link
                href="/prazo-entrega"
                className="transition-colors hover:text-foreground"
              >
                Prazo e entregas
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
