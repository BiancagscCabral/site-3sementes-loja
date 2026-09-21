"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path
        d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4c2-.3 3.8.8 6.5 3.2C14.7 4.8 16.5 3.7 18.5 4 22 4.5 23.3 8 21.5 11.5 19 15.65 12 20 12 20Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path d="M6 8h12l1 13H5L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
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

function SearchForm({ autoFocusable = false }: { autoFocusable?: boolean }) {
  return (
    <form
      action="/busca"
      className="flex w-full items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted"
    >
      <button type="submit" aria-label="Buscar" className="shrink-0">
        <SearchIcon />
      </button>
      <input
        type="search"
        name="q"
        autoFocus={autoFocusable}
        placeholder="Buscar produtos..."
        className="ml-2 w-full bg-transparent text-foreground outline-none placeholder:text-muted"
      />
    </form>
  );
}

export default function Header() {
  const { itemCount, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-10">
      <div
        className={`overflow-hidden bg-primary-dark text-center text-xs tracking-wide text-primary-foreground transition-all duration-300 ${
          scrolled ? "max-h-0 py-0 opacity-0" : "max-h-10 py-2 opacity-100"
        }`}
      >
        Peças artesanais feitas à mão &middot; Envio para todo o Brasil
      </div>

      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4 sm:gap-6 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/img/logo.png"
              alt="3sementes"
              width={56}
              height={56}
              priority
              className="h-10 w-10 sm:h-14 sm:w-14"
            />
            <span className="leading-none">
              <span className="font-display block text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                3sementes
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.25em] text-accent sm:mt-1 sm:text-xs sm:tracking-[0.3em]">
                Store
              </span>
            </span>
          </Link>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              scrolled ? "max-w-0 opacity-0" : "max-w-full flex-1 opacity-100"
            }`}
          >
            <div className="hidden sm:flex">
              <SearchForm />
            </div>
          </div>

          <div
            className={`ml-auto flex items-center gap-3 text-foreground sm:gap-4 transition-all duration-300 sm:ml-0 ${
              scrolled
                ? "invisible max-w-0 overflow-hidden opacity-0"
                : "max-w-full opacity-100"
            }`}
          >
            <button type="button" aria-label="Minha conta" className="hidden sm:block">
              <UserIcon />
            </button>
            <button type="button" aria-label="Favoritos">
              <HeartIcon />
            </button>
            <Link href="/carrinho" aria-label="Carrinho" className="relative">
              <BagIcon />
              {ready && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-none text-accent-foreground ring-2 ring-background">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="sm:hidden"
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>

        <nav className="hidden flex-wrap justify-center gap-2 border-t border-border px-6 py-3 sm:flex">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/categorias/${category.slug}`}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {menuOpen && (
          <div className="border-t border-border bg-surface px-6 py-5 sm:hidden">
            <SearchForm autoFocusable />

            <nav
              onClick={() => setMenuOpen(false)}
              className="mt-5 flex flex-col gap-1"
            >
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorias/${category.slug}`}
                  className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div
              onClick={() => setMenuOpen(false)}
              className="mt-5 flex flex-col gap-1 border-t border-border pt-4 text-sm text-muted"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3 py-2.5 transition-colors hover:text-foreground"
              >
                Falar no WhatsApp
              </a>
              <Link
                href="/trocas-e-devolucoes"
                className="rounded-xl px-3 py-2.5 transition-colors hover:text-foreground"
              >
                Entrega, trocas e devoluções
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
