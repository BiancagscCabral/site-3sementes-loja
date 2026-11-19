"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const INTERVALO = 2.5; // segundos entre uma peça e outra
const PAUSA_APOS_TOQUE = 8; // segundos parado depois que a pessoa encosta

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
  automatico = false,
}: {
  children: React.ReactNode;
  rotulo: string;
  automatico?: boolean;
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

  // Avanço automático: uma peça a cada INTERVALO. Fica parado enquanto o mouse
  // está em cima, o foco está dentro, a pessoa mexeu há pouco ou a fileira está
  // fora da tela. Ao chegar no fim, volta para o começo.
  const parado = useRef(false);
  const pausaAte = useRef(0);
  const visivel = useRef(false);

  function pausarPor(ms: number) {
    pausaAte.current = Date.now() + ms;
  }

  useEffect(() => {
    if (!automatico) return;
    const el = faixa.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel.current = entrada.isIntersecting;
      },
      { threshold: 0.5 },
    );
    observador.observe(el);

    const timer = setInterval(() => {
      if (parado.current || !visivel.current) return;
      if (Date.now() < pausaAte.current) return;
      if (el.scrollWidth <= el.clientWidth + 4) return;

      const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (noFim) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const [primeiro, segundo] = [el.children[0], el.children[1]] as HTMLElement[];
      const passo = segundo ? segundo.offsetLeft - primeiro.offsetLeft : el.clientWidth;
      el.scrollBy({ left: passo, behavior: "smooth" });
    }, INTERVALO * 1000);

    return () => {
      clearInterval(timer);
      observador.disconnect();
    };
  }, [automatico]);

  const botao =
    "absolute top-1/2 z-10 hidden h-16 w-9 -translate-y-1/2 cursor-pointer items-center justify-center bg-background/95 text-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex";

  return (
    <div
      className="relative"
      role="region"
      aria-label={rotulo}
      onMouseEnter={() => (parado.current = true)}
      onMouseLeave={() => (parado.current = false)}
      onFocus={() => (parado.current = true)}
      onBlur={() => (parado.current = false)}
      onTouchStart={() => pausarPor(PAUSA_APOS_TOQUE * 1000)}
    >
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
          className={`${botao} left-0 rounded-r-xl`}
        >
          <SetaIcon direcao="anterior" />
        </button>
      )}
      {podeAvancar && (
        <button
          type="button"
          aria-label="Próximos produtos"
          onClick={() => mover(1)}
          className={`${botao} right-0 rounded-l-xl`}
        >
          <SetaIcon direcao="proxima" />
        </button>
      )}
    </div>
  );
}
