import Link from "next/link";
import HeroCarousel, { type FotoDoBanner } from "@/components/HeroCarousel";
import { Estrela, Flor } from "@/components/Grafismos";
import { IconeSeta } from "@/components/Icones";

// Arte do lado direito do banner: ondas rosa, amarela e terracota. O desenho
// cobre 830 x 460 e é esticado para a caixa em que for colocado.
function ArteDoBanner({
  className,
  preserveAspectRatio = "none",
}: {
  className?: string;
  preserveAspectRatio?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 830 460"
      preserveAspectRatio={preserveAspectRatio}
      className={className}
    >
      <path
        className="fill-rose/60"
        d="M260 0C215 60 255 120 195 190C150 245 175 305 200 345C225 388 165 425 190 460H830V0Z"
      />
      <path
        className="fill-rose"
        d="M305 0C265 55 298 108 247 170C207 220 227 272 247 312C267 352 222 408 237 460H830V0Z"
      />
      <path
        className="fill-sun"
        d="M520 460C560 390 645 350 705 298C765 246 795 186 830 136V460Z"
      />
      <path
        className="fill-primary"
        d="M600 460C660 400 750 370 830 252V460Z"
      />
      <path className="fill-rose" d="M730 460C760 432 800 416 830 410V460Z" />
      <path
        className="fill-sun"
        d="M20 460C35 400 95 355 170 353C245 351 280 415 292 460Z"
      />
      <path
        className="fill-primary"
        d="M95 460C112 432 175 410 232 418C268 424 288 440 300 460Z"
      />
      <path
        className="stroke-surface"
        fill="none"
        strokeWidth={9}
        strokeLinecap="round"
        d="M690 72l12-30M718 58l15-34M748 66l28-20"
      />
    </svg>
  );
}

// Banner do topo da home. No computador: texto à esquerda sobre o creme, arte
// de ondas e foto grande à direita. No celular: texto em cima e a foto embaixo,
// sobre a mesma arte.
export default function BannerDoTopo({ fotos }: { fotos: FotoDoBanner[] }) {
  return (
    <section className="relative overflow-hidden bg-background md:h-[460px]">
      <ArteDoBanner className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[66%] md:block" />

      {/* Manchas coladas na borda esquerda */}
      <svg
        aria-hidden
        viewBox="0 0 80 460"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 md:block"
      >
        <path
          className="fill-primary"
          d="M0 178C42 188 60 232 46 266C38 284 16 296 0 296Z"
        />
        <path
          className="fill-sun"
          d="M0 290C42 296 92 346 86 402C84 430 70 444 62 460H0Z"
        />
        <path className="fill-rose" d="M0 385C30 390 52 415 46 460H0Z" />
      </svg>

      <div className="relative z-10 mx-auto h-full w-full max-w-5xl px-5 pb-6 pt-8 sm:px-6 md:flex md:items-center md:py-0">
        <div className="md:max-w-[44%]">
          <div className="relative w-fit">
            <h1 className="max-w-[12ch] font-display text-[40px] font-semibold leading-[1.05] text-primary md:text-[46px] lg:text-[56px]">
              Feito à mão, cheio de significado.
            </h1>
            <Flor className="pointer-events-none absolute -top-1 left-full ml-4 hidden h-16 w-16 text-sun lg:block" />
          </div>
          <div className="relative mt-4 max-w-[34ch]">
            <p className="text-base leading-7 text-foreground sm:text-lg">
              Acessórios, flores e criações personalizadas para você e seus
              rituais.
            </p>
            <Estrela className="pointer-events-none absolute left-full top-1/2 ml-8 hidden h-7 w-7 -translate-y-1/2 text-primary lg:block" />
          </div>
          <Link
            href="#categorias"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Conheça a loja
            <IconeSeta className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>

      {/* Foto: embaixo do texto no celular; sobre as ondas, à direita, no computador */}
      <div className="relative h-[340px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[56%]">
        <ArteDoBanner
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
        />
        <HeroCarousel midia={fotos} />
      </div>
    </section>
  );
}
