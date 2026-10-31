"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Barra fina no topo durante a troca de página.
//
// O site é rápido demais: a maioria das páginas já vem pré-carregada e troca
// em poucos milissegundos, então o clique parece não ter acontecido. A barra
// não deixa nada mais lento — ela só mostra que algo está indo, e fica visível
// por um tempo mínimo para não piscar e sumir.
const TEMPO_MINIMO_MS = 400;

export default function BarraDeCarregamento() {
  const pathname = usePathname();
  const [visivel, setVisivel] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const comecouEm = useRef(0);

  // Começa no clique em qualquer link interno.
  useEffect(() => {
    const aoClicar = (evento: MouseEvent) => {
      if (
        evento.defaultPrevented ||
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey
      ) {
        return;
      }

      const link = (evento.target as HTMLElement | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const destino = new URL(link.href, window.location.href);
      if (destino.origin !== window.location.origin) return;
      if (destino.pathname === window.location.pathname) return;

      comecouEm.current = Date.now();
      setVisivel(true);
      setProgresso(8);
    };

    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  // Enquanto a página não troca, a barra avança sozinha — devagar e sem nunca
  // chegar ao fim, porque não dá para saber quanto falta.
  useEffect(() => {
    if (!visivel) return;
    const timer = setInterval(() => {
      setProgresso((atual) => (atual >= 90 ? atual : atual + (90 - atual) * 0.18));
    }, 120);
    return () => clearInterval(timer);
  }, [visivel]);

  // Página trocou: completa e some.
  useEffect(() => {
    if (!comecouEm.current) return;

    const decorrido = Date.now() - comecouEm.current;
    const espera = Math.max(0, TEMPO_MINIMO_MS - decorrido);

    const completar = setTimeout(() => setProgresso(100), espera);
    const esconder = setTimeout(() => {
      setVisivel(false);
      setProgresso(0);
      comecouEm.current = 0;
    }, espera + 260);

    return () => {
      clearTimeout(completar);
      clearTimeout(esconder);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] transition-opacity duration-200 ${
        visivel ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-accent transition-[width] duration-200 ease-out"
        style={{ width: `${progresso}%` }}
      />
    </div>
  );
}
