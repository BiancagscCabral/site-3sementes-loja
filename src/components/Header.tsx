"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";

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

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

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
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/" className="shrink-0 leading-none">
            <span className="font-display block text-xl font-medium tracking-tight text-foreground">
              3sementes
            </span>
            <span className="-mt-0.5 block text-right text-[10px] font-medium uppercase tracking-[0.25em] text-accent">
              Store
            </span>
          </Link>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              scrolled ? "max-w-0 opacity-0" : "max-w-full flex-1 opacity-100"
            }`}
          >
            <div className="hidden items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted sm:flex">
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="ml-2 w-full bg-transparent outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div
            className={`ml-auto flex items-center gap-4 overflow-hidden text-foreground transition-all duration-300 sm:ml-0 ${
              scrolled ? "max-w-0 opacity-0" : "max-w-full opacity-100"
            }`}
          >
            <button type="button" aria-label="Minha conta">
              <UserIcon />
            </button>
            <button type="button" aria-label="Favoritos">
              <HeartIcon />
            </button>
            <button type="button" aria-label="Carrinho" className="relative">
              <BagIcon />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
                0
              </span>
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
      </header>
    </div>
  );
}
