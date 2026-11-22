import Link from "next/link";
import { ArteDoBanner } from "@/components/ArteDoBanner";
import HeroCarousel, { type FotoDoBanner } from "@/components/HeroCarousel";
import { Flor } from "@/components/Grafismos";
import { IconeSeta } from "@/components/Icones";

// Banner do topo da home. No computador: texto à esquerda sobre o creme, arte
// de ondas e foto grande à direita. No celular: texto em cima e a foto embaixo,
// sobre a mesma arte.
export default function BannerDoTopo({ fotos }: { fotos: FotoDoBanner[] }) {
  return (
    <section className="relative overflow-hidden bg-background md:h-[460px]">
      <ArteDoBanner className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[63.4%] md:block" />

      {/* Manchas coladas na borda esquerda: terracota, amarela e rosa */}
      <svg
        aria-hidden
        viewBox="0 0 100 452"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-12 md:block lg:w-20"
      >
        <path
          className="fill-primary"
          d="M0 175C30 180 45 215 38 250C34 270 15 285 0 290Z"
        />
        <path
          className="fill-sun"
          d="M0 270C40 280 95 330 92 385C90 420 75 440 62 452H0Z"
        />
        <path
          className="fill-rose"
          d="M0 360C28 365 58 392 52 430C50 440 45 447 42 452H0Z"
        />
      </svg>

      <div className="relative z-10 mx-auto h-full w-full max-w-5xl px-5 pb-6 pt-8 sm:px-6 md:flex md:items-center md:py-0">
        <div className="md:max-w-[44%]">
          <div className="relative w-fit">
            <h1 className="max-w-[12ch] font-display text-[40px] font-semibold leading-[1.05] text-primary md:text-[46px] lg:text-[56px]">
              Feito à mão, cheio de significado.
            </h1>
            <Flor className="pointer-events-none absolute -top-1 left-full ml-4 hidden h-16 w-16 text-sun lg:block" />
          </div>
          <p className="mt-4 max-w-[34ch] text-base leading-7 text-foreground sm:text-lg">
            Acessórios, flores e criações personalizadas para você e seus
            rituais.
          </p>
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
