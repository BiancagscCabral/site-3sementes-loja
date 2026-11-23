"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sair from "@/components/Sair";
import {
  IconeCaixa,
  IconeCamadas,
  IconeClientes,
  IconeEngrenagem,
  IconeMenu,
  IconeSacola,
  IconeSair,
} from "@/components/Icones";

const ITENS = [
  { href: "/admin", rotulo: "Pedidos", Icone: IconeSacola, exato: true },
  { href: "/admin/produtos", rotulo: "Produtos", Icone: IconeCaixa },
  { href: "/admin/categorias", rotulo: "Categorias", Icone: IconeCamadas },
  { href: "/admin/clientes", rotulo: "Clientes", Icone: IconeClientes },
  {
    href: "/admin/configuracoes",
    rotulo: "Configurações",
    Icone: IconeEngrenagem,
  },
];

function Logo({ className }: { className: string }) {
  return (
    <Link
      href="/admin"
      aria-label="3Sementes Store, painel"
      className="shrink-0"
    >
      <Image
        src="/img/logo-3sementes.png"
        alt="3Sementes Store"
        width={900}
        height={307}
        sizes="170px"
        className={className}
      />
    </Link>
  );
}

function Itens({ aoEscolher }: { aoEscolher?: () => void }) {
  const caminho = usePathname();
  return (
    <ul className="flex flex-col gap-1.5">
      {ITENS.map(({ href, rotulo, Icone, exato }) => {
        const ativo = exato ? caminho === href : caminho.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={aoEscolher}
              aria-current={ativo ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors ${
                ativo
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted-bg"
              }`}
            >
              <Icone className="h-5 w-5 shrink-0" />
              {rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Menu lateral do painel (no celular vira uma barra no topo com o menu
// recolhido). O canto de baixo leva a arte de ondas da identidade da loja.
export default function MenuDoAdmin() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* Celular e tablet */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface lg:hidden">
        <div className="flex items-center justify-between px-5 py-2.5">
          <Logo className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            className="cursor-pointer p-1 text-foreground"
          >
            <IconeMenu aberto={aberto} className="h-6 w-6" />
          </button>
        </div>
        {aberto && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <Itens aoEscolher={() => setAberto(false)} />
            <Sair
              className="mt-3 flex h-11 w-full cursor-pointer items-center gap-3 rounded-full border border-border px-4 text-[15px] font-semibold text-foreground"
              icone={<IconeSair className="h-5 w-5" />}
            />
          </div>
        )}
      </header>

      {/* Computador */}
      <aside className="relative hidden w-[240px] shrink-0 overflow-hidden border-r border-border bg-surface lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-5 pb-6 pt-6">
          <svg
            aria-hidden
            viewBox="0 0 240 200"
            preserveAspectRatio="xMinYMax slice"
            className="pointer-events-none absolute -left-px bottom-0 h-[200px] w-full"
          >
            <path
              className="fill-sun"
              d="M0 40C34 44 58 76 56 116C54 150 40 176 0 200Z"
            />
            <path className="fill-rose" d="M0 130C30 140 58 160 70 200H0Z" />
            <path className="fill-primary" d="M0 168C20 172 40 186 48 200H0Z" />
          </svg>

          <Logo className="mx-auto h-[62px] w-auto" />
          <nav aria-label="Painel" className="mt-9">
            <Itens />
          </nav>

          <Sair
            className="relative z-10 mt-auto flex h-11 w-[150px] cursor-pointer items-center gap-3 self-end rounded-full border border-border bg-surface px-4 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted-bg"
            icone={<IconeSair className="h-5 w-5" />}
          />
        </div>
      </aside>
    </>
  );
}
