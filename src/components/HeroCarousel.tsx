"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroMedia } from "@/lib/hero";

const SEGUNDOS = 6;

export type FotoDoBanner = HeroMedia & { alt?: string };

// Arquivo com "recorte" no nome (ex: 01-buque-recorte.png) é uma peça sem
// fundo: aparece solta, por cima das ondas do banner. Qualquer outro arquivo
// é uma foto comum e flutua por cima das ondas, só com os cantos arredondados:
// sem moldura, sem sombra, sem nenhuma marca ao redor.
const ehRecorte = (url: string) => /recorte/i.test(url);

// Fotos do banner do topo. Preenche a caixa em que for colocado (que precisa
// ser `relative`): as fotos se alternam em transição suave e, com uma só, ela
// fica parada. Respeita a preferência por menos movimento e tem bolinhas para
// escolher a foto.
export default function HeroCarousel({ midia }: { midia: FotoDoBanner[] }) {
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (midia.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setAtual((indice) => (indice + 1) % midia.length);
    }, SEGUNDOS * 1000);

    return () => clearInterval(timer);
  }, [midia.length, atual]);

  if (midia.length === 0) return null;

  return (
    <>
      {midia.map((item, indice) => (
        <div
          key={item.url}
          aria-hidden={indice !== atual}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            indice === atual ? "opacity-100" : "opacity-0"
          }`}
        >
          {ehRecorte(item.url) ? (
            <div className="absolute inset-x-0 -top-[5%] bottom-0">
              <Image
                src={item.url}
                alt={item.alt ?? ""}
                fill
                sizes="(min-width: 768px) 56vw, 100vw"
                priority={indice === 0}
                className="object-contain object-bottom"
              />
            </div>
          ) : (
            <div className="absolute inset-x-[9%] bottom-[14%] top-[5%] overflow-hidden rounded-[28px] md:inset-y-[9%] md:left-[19%] md:right-[16%]">
              {item.tipo === "video" ? (
                <video
                  src={item.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt ?? ""}
                  fill
                  sizes="(min-width: 768px) 38vw, 82vw"
                  priority={indice === 0}
                  className="object-cover contrast-[1.06] saturate-[1.12]"
                />
              )}
            </div>
          )}
        </div>
      ))}

      {midia.length > 1 && (
        <div
          role="group"
          aria-label="Escolher foto"
          className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 md:justify-start md:pl-14"
        >
          {midia.map((item, indice) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setAtual(indice)}
              aria-label={`Foto ${indice + 1} de ${midia.length}`}
              aria-current={indice === atual}
              className={`h-2.5 rounded-full transition-all ${
                indice === atual
                  ? "w-6 bg-surface"
                  : "w-2.5 bg-surface/55 hover:bg-surface"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
