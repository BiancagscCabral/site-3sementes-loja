"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, WHATSAPP_URL } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { Estrela } from "@/components/Grafismos";
import {
  IconeBusca,
  IconeCaminhao,
  IconeConta,
  IconeMenu,
  IconeSacola,
  IconeSetaBaixo,
} from "@/components/Icones";

// O que entra no menu "Acessórios": as peças de joalheria e afins. As demais
// categorias (Guias, 3SFlores) têm link próprio no menu.
const ACESSORIOS = [
  "braceletes",
  "colares",
  "pulseiras",
  "tornozeleiras",
  "aneis",
  "acessorios",
]
  .map((slug) => CATEGORIES.find((categoria) => categoria.slug === slug))
  .filter((categoria) => categoria !== undefined);

const LINKS = [
  { href: "/categorias/guias", rotulo: "Guias e Brajás" },
  { href: "/categorias/flores-eternas", rotulo: "3SFlores" },
  { href: "/#sobre", rotulo: "Sobre nós" },
];

function SearchForm({ autoFocusable = false }: { autoFocusable?: boolean }) {
  return (
    <form
      action="/busca"
      role="search"
      className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5"
    >
      <button
        type="submit"
        aria-label="Buscar"
        className="shrink-0 text-muted transition-colors hover:text-primary"
      >
        <IconeBusca className="h-[18px] w-[18px]" />
      </button>
      <input
        type="search"
        name="q"
        autoFocus={autoFocusable}
        placeholder="Buscar bracelete, guia, buquê"
        className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
      />
    </form>
  );
}

const ESTILO_LINK =
  "whitespace-nowrap text-[15px] font-medium text-foreground transition-colors hover:text-primary";

export default function Header() {
  const { itemCount, ready } = useCart();
  const caminho = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [categoriasAbertas, setCategoriasAbertas] = useState(false);
  const categoriasRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de Acessórios ao clicar fora dele ou apertar Esc.
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

  const quantidade = ready ? itemCount : 0;
  const ativo = (href: string) =>
    href === "/" ? caminho === "/" : caminho.startsWith(href.split("#")[0]);
  const noAcessorios = ACESSORIOS.some((categoria) =>
    caminho.startsWith(`/categorias/${categoria.slug}`),
  );
  const marca = (ligado: boolean) =>
    ligado
      ? "underline decoration-primary decoration-2 underline-offset-[10px]"
      : "";

  return (
    <div className="sticky top-0 z-30">
      <div className="bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground sm:px-4 sm:text-[13px]">
        <ul className="mx-auto flex max-w-5xl items-center justify-center gap-x-2.5 whitespace-nowrap sm:gap-x-4">
          <li className="flex items-center gap-2">
            <IconeCaminhao className="hidden h-4 w-4 text-sun sm:block" />
            Envio para todo o Brasil
          </li>
          <li aria-hidden className="hidden sm:block">
            <Estrela className="h-3 w-3 text-sun" />
          </li>
          <li className="hidden sm:block">Produção artesanal</li>
          <li aria-hidden>
            <Estrela className="h-3 w-3 text-sun" />
          </li>
          <li>Personalize do seu jeito!</li>
        </ul>
      </div>

      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-2.5 sm:gap-5 sm:px-6 sm:py-3">
          <button
            type="button"
            onClick={() => setMenuOpen((aberto) => !aberto)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="-ml-1 p-1 text-foreground lg:hidden"
          >
            <IconeMenu aberto={menuOpen} className="h-6 w-6" />
          </button>

          <Link href="/" aria-label="3Sementes Store, página inicial" className="shrink-0">
            <Image
              src="/img/logo-3sementes.png"
              alt="3Sementes Store"
              width={900}
              height={307}
              sizes="(min-width: 640px) 170px, 130px"
              priority
              className="h-11 w-auto sm:h-[58px]"
            />
          </Link>

          <nav
            aria-label="Principal"
            className="hidden items-center gap-6 lg:ml-6 lg:flex"
          >
            <Link
              href="/"
              aria-current={caminho === "/" ? "page" : undefined}
              className={`${ESTILO_LINK} ${marca(caminho === "/")}`}
            >
              Início
            </Link>

            <div ref={categoriasRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoriasAbertas((aberto) => !aberto)}
                aria-expanded={categoriasAbertas}
                aria-haspopup="true"
                className={`${ESTILO_LINK} flex items-center gap-1 ${marca(noAcessorios)}`}
              >
                Acessórios
                <IconeSetaBaixo
                  className={`h-4 w-4 transition-transform duration-200 ${
                    categoriasAbertas ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriasAbertas && (
                <div
                  onClick={() => setCategoriasAbertas(false)}
                  className="absolute left-0 top-[calc(100%+14px)] z-20 w-60 rounded-2xl border border-border bg-surface p-2 shadow-lg"
                >
                  {ACESSORIOS.map((categoria) => (
                    <Link
                      key={categoria.slug}
                      href={`/categorias/${categoria.slug}`}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted-bg hover:text-primary"
                    >
                      {categoria.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo(link.href) && link.href !== "/#sobre" ? "page" : undefined}
                className={`${ESTILO_LINK} ${marca(ativo(link.href) && link.href !== "/#sobre")}`}
              >
                {link.rotulo}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4 text-foreground sm:gap-5">
            <button
              type="button"
              onClick={() => setBuscaAberta((aberta) => !aberta)}
              aria-label={buscaAberta ? "Fechar a busca" : "Buscar"}
              aria-expanded={buscaAberta}
              className="transition-colors hover:text-primary"
            >
              <IconeBusca className="h-6 w-6" />
            </button>

            <Link
              href="/minha-conta"
              aria-label="Minha conta"
              className="hidden transition-colors hover:text-primary sm:block"
            >
              <IconeConta className="h-6 w-6" />
            </Link>

            <Link
              href="/carrinho"
              aria-label={`Sacola com ${quantidade} ${
                quantidade === 1 ? "peça" : "peças"
              }`}
              className="relative transition-colors hover:text-primary"
            >
              <IconeSacola className="h-6 w-6" />
              <span className="absolute -right-2 -top-2 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none tabular-nums text-primary-foreground">
                {quantidade}
              </span>
            </Link>
          </div>
        </div>

        {buscaAberta && (
          <div className="border-t border-border bg-background px-5 py-3 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <SearchForm autoFocusable />
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="border-t border-border bg-surface px-5 py-5 lg:hidden">
            <nav
              aria-label="Menu"
              onClick={() => setMenuOpen(false)}
              className="flex flex-col"
            >
              <Link
                href="/"
                className="border-b border-border py-3 text-[15px] font-medium text-foreground"
              >
                Início
              </Link>
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorias/${category.slug}`}
                  className="border-b border-border py-3 text-[15px] font-medium text-foreground"
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
                className="transition-colors hover:text-primary"
              >
                Falar no WhatsApp
              </a>
              <Link
                href="/minha-conta"
                className="transition-colors hover:text-primary"
              >
                Minha conta
              </Link>
              <Link
                href="/prazo-entrega"
                className="transition-colors hover:text-primary"
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
