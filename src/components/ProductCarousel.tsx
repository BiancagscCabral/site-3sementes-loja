"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function SetaIcon({ direcao }: { direcao: "anterior" | "proxima" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      className={`h-[18px] w-[18px] ${direcao === "anterior" ? "rotate-180" : ""}`}
    >
      <path d="M5 12h13M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Fileira de produtos que desliza de lado. No celular é só arrastar com o dedo
// (o card seguinte aparece pela metade para mostrar que tem mais); no computador
// entram duas setas, que somem quando não há para onde ir.
export default function ProductCarousel({
  children,
  rotulo,
}: {
  children: React.ReactNode;
  rotulo: string;
}) {
  const faixa = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const atualizar = useCallback(() => {
    const el = faixa.current;
    if (!el) return;
    setPodeVoltar(el.scrollLeft > 4);
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    atualizar();
    const observador = new ResizeObserver(atualizar);
    observador.observe(el);
    return () => observador.disconnect();
  }, [atualizar]);

  function mover(sentido: -1 | 1) {
    const el = faixa.current;
    if (!el) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: sentido * el.clientWidth * 0.9,
      behavior: reduzido ? "auto" : "smooth",
    });
  }

  const botao =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex";

  return (
    <div className="relative" role="region" aria-label={rotulo}>
      <div
        ref={faixa}
        onScroll={atualizar}
        className="carousel-scroll -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 py-3 sm:-mx-3 sm:scroll-px-3 sm:gap-[26px] sm:px-3"
      >
        {children}
      </div>

      {podeVoltar && (
        <button
          type="button"
          aria-label="Produtos anteriores"
          onClick={() => mover(-1)}
          className={`${botao} -left-5`}
        >
          <SetaIcon direcao="anterior" />
        </button>
      )}
      {podeAvancar && (
        <button
          type="button"
          aria-label="Próximos produtos"
          onClick={() => mover(1)}
          className={`${botao} -right-5`}
        >
          <SetaIcon direcao="proxima" />
        </button>
      )}
    </div>
  );
}
