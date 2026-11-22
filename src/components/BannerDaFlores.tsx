import Image from "next/image";
import Link from "next/link";
import { ArteDoBanner } from "@/components/ArteDoBanner";
import { Flor, Mancha } from "@/components/Grafismos";
import { IconeSeta } from "@/components/Icones";

// Faixa de destaque da 3SFlores: fundo rosa em degradê, título com a flor,
// texto, botão e, à direita, o buquê recortado flutuando sobre as mesmas ondas
// do banner do topo. A foto do buquê (sem fundo) fica em public/img/flores; para
// trocar, basta substituir o arquivo por outro recorte. As formas valem aqui
// porque é um banner (ver Grafismos).
export default function BannerDaFlores() {
  return (
    <section className="theme-flores px-5 py-4 sm:px-6">
      <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-rose/25 via-rose/45 to-rose/70 md:grid-cols-[1fr_1.05fr]">
        <Mancha
          forma={1}
          className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 text-rose/60"
        />

        <div className="relative z-10 p-8 sm:p-10 md:py-14 md:pl-12">
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

        <div className="relative h-[340px] md:h-auto md:min-h-[460px]">
          <ArteDoBanner className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent,black_35%)] md:[mask-image:none]" />
          {/* O buquê encosta na borda de baixo: o braço sai do quadro. */}
          <div className="absolute inset-x-0 bottom-0 top-4 md:top-5 md:left-[4%] md:right-[14%]">
            <Image
              src="/img/flores/buque-banner-recorte.png"
              alt="Buquê eterno em chenille da 3SFlores"
              fill
              sizes="(min-width: 768px) 420px, 70vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
