import Image from "next/image";
import Link from "next/link";
import { Flor, Mancha } from "@/components/Grafismos";
import { IconeSeta } from "@/components/Icones";

// Borda esquerda ondulada da foto (em proporção da caixa, de 0 a 1).
const ONDA =
  "M0.1 0H1V1H0.1C0.02 0.88 0.18 0.78 0.1 0.66C0.02 0.54 0.18 0.44 0.1 0.32C0.02 0.2 0.18 0.1 0.1 0Z";

// Faixa de destaque da 3SFlores: fundo rosa em degradê, título com a flor,
// texto, botão e a foto de um buquê com a borda esquerda ondulada, sobre uma
// onda amarela. As formas valem aqui porque é um banner (ver Grafismos).
export default function BannerDaFlores({
  foto,
}: {
  foto: { url: string; alt: string } | null;
}) {
  return (
    <section className="theme-flores px-5 py-4 sm:px-6">
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <clipPath id="recorte-flores" clipPathUnits="objectBoundingBox">
            <path d={ONDA} />
          </clipPath>
        </defs>
      </svg>

      <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-rose/25 via-rose/45 to-rose/70 md:grid-cols-[1fr_1.05fr]">
        <Mancha
          forma={1}
          className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 text-rose/60"
        />

        <div className="relative z-10 p-8 sm:p-10 md:py-12 md:pl-12">
          <div className="flex items-center gap-3">
            <Flor
              miolo="var(--sun)"
              className="h-11 w-11 shrink-0 text-primary sm:h-14 sm:w-14"
            />
            <h2 className="font-display text-[44px] font-semibold leading-none text-primary sm:text-[52px]">
              3SFlores
            </h2>
          </div>
          <p className="mt-4 max-w-[30ch] text-lg leading-snug text-foreground sm:text-xl">
            Buquês eternos, feitos à mão em chenille, para presentear, celebrar
            e encantar.
          </p>
          <Link
            href="/categorias/flores-eternas"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Conheça a coleção
            <IconeSeta className="h-[18px] w-[18px]" />
          </Link>
        </div>

        <div className="relative min-h-[240px] md:min-h-[320px]">
          {/* onda amarela atrás da foto, um pouco à esquerda */}
          <svg
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-3 hidden h-full w-full text-sun md:block"
          >
            <path d={ONDA} fill="currentColor" />
          </svg>
          {foto && (
            <div className="recorte-flores absolute inset-0">
              <Image
                src={foto.url}
                alt={foto.alt}
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
