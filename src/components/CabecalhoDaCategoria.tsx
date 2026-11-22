import Link from "next/link";
import { Flor } from "@/components/Grafismos";
import {
  IconeAcessorios,
  IconeBraceletes,
  IconeBuque,
  IconeColares,
  IconeGuias,
} from "@/components/Icones";

// Ícone em arte de cada categoria (os mesmos dos atalhos da home), com o
// tamanho que mantém a proporção do desenho ao lado do título. Categorias sem
// ícone próprio (pulseiras, tornozeleiras, anéis) ficam com a flor.
const ICONES: Record<
  string,
  { Icone: (props: { className?: string }) => React.ReactNode; tamanho: string }
> = {
  braceletes: {
    Icone: IconeBraceletes,
    tamanho: "h-9 w-[29px] sm:h-12 sm:w-[39px]",
  },
  colares: { Icone: IconeColares, tamanho: "h-9 w-[32px] sm:h-12 sm:w-[42px]" },
  guias: { Icone: IconeGuias, tamanho: "h-9 w-[17px] sm:h-12 sm:w-[23px]" },
  "flores-eternas": { Icone: IconeBuque, tamanho: "h-9 w-9 sm:h-12 sm:w-12" },
  acessorios: { Icone: IconeAcessorios, tamanho: "h-9 w-9 sm:h-12 sm:w-12" },
};

// Faixa do topo das páginas de categoria: trilha de navegação, título com uma
// flor ao lado, subtítulo e a arte de ondas (terracota na borda esquerda; rosa,
// amarela e terracota à direita).
export default function CabecalhoDaCategoria({
  slug,
  trilha,
  titulo,
  subtitulo,
}: {
  /** Slug da categoria, para escolher o ícone ao lado do título. */
  slug: string;
  /** Último item é a página atual (sem link). */
  trilha: { rotulo: string; href?: string }[];
  titulo: string;
  subtitulo: string;
}) {
  const icone = ICONES[slug];

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <svg
        aria-hidden
        viewBox="0 0 700 200"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[52%] sm:block"
      >
        <path
          className="fill-rose"
          d="M250 200C280 150 340 126 400 96C460 66 500 22 560 0H700V200Z"
        />
        <path
          className="fill-sun"
          d="M60 200C110 172 190 176 270 148C350 120 400 90 470 82C560 72 640 60 700 36V200Z"
        />
        <path
          className="fill-primary"
          d="M420 200C470 160 540 150 600 124C650 102 680 70 700 52V200Z"
        />
        <path
          className="fill-sun"
          d="M60 200C90 176 150 168 210 184C240 192 250 196 260 200Z"
        />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 90 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 top-0 hidden h-full w-14 sm:block"
      >
        <path
          className="fill-primary"
          d="M0 40C34 52 58 84 50 122C46 142 24 160 0 168Z"
        />
        <path
          className="fill-rose"
          d="M0 120C28 130 50 156 44 184C42 192 40 198 38 200H0Z"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-6 sm:px-6 sm:pb-10">
        <nav aria-label="Você está em" className="text-[13px] text-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {trilha.map((item, indice) => (
              <li key={item.rotulo} className="flex items-center gap-2">
                {indice > 0 && <span aria-hidden>&rsaquo;</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary hover:underline"
                  >
                    {item.rotulo}
                  </Link>
                ) : (
                  <span
                    aria-current={
                      indice === trilha.length - 1 ? "page" : undefined
                    }
                    className={
                      indice === trilha.length - 1
                        ? "font-semibold text-foreground"
                        : ""
                    }
                  >
                    {item.rotulo}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4 flex items-center gap-3">
          <h1 className="font-display text-[40px] font-semibold leading-none text-primary sm:text-[56px]">
            {titulo}
          </h1>
          {icone ? (
            <icone.Icone className={`shrink-0 text-primary ${icone.tamanho}`} />
          ) : (
            <Flor className="hidden h-11 w-11 text-sun sm:block" />
          )}
        </div>
        <p className="mt-3 max-w-[36ch] text-base leading-7 text-foreground sm:text-lg">
          {subtitulo}
        </p>
      </div>
    </section>
  );
}
