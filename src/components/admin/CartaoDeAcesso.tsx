import Image from "next/image";
import { Flor } from "@/components/Grafismos";

// Moldura das telas de entrar e de criar senha: cartão creme com a logo, ondas
// nos cantos e uma flor embaixo, como no protótipo do painel.
export default function CartaoDeAcesso({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-border bg-surface px-7 pb-24 pt-14 sm:px-10">
        <svg
          aria-hidden
          viewBox="0 0 140 140"
          className="pointer-events-none absolute left-0 top-0 h-[120px] w-[120px]"
        >
          <path
            className="fill-sun"
            d="M0 0H112C86 14 62 22 40 52C26 70 12 90 0 104Z"
          />
          <path
            className="fill-rose"
            d="M0 60C20 66 38 80 40 104C28 122 12 134 0 140Z"
          />
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 260 150"
          preserveAspectRatio="xMaxYMax meet"
          className="pointer-events-none absolute bottom-0 right-0 h-[130px] w-[230px]"
        >
          <path
            className="fill-sun"
            d="M260 20C220 30 190 70 150 100C120 120 90 130 60 150H260Z"
          />
          <path
            className="fill-rose"
            d="M130 150C150 124 190 112 230 96C246 90 254 84 260 78V150Z"
          />
          <path
            className="fill-primary"
            d="M190 150C206 128 236 118 260 104V150Z"
          />
        </svg>
        <Flor
          miolo="var(--sun)"
          className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 text-primary"
        />

        <div className="relative">
          <Image
            src="/img/logo-3sementes.png"
            alt="3Sementes Store"
            width={900}
            height={307}
            priority
            className="mx-auto h-[84px] w-auto"
          />
          <h1 className="mt-9 text-center font-display text-[32px] font-semibold leading-tight text-primary">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-2 text-center text-[15px] text-foreground">
              {subtitulo}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
