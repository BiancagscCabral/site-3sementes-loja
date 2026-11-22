"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroMedia } from "@/lib/hero";

const SEGUNDOS = 6;

type Foto = HeroMedia & { alt?: string };

// Fotos de fundo do banner do topo. Preenche a caixa em que for colocado (que
// precisa ser `relative`): as fotos se alternam em transição suave e, com uma
// só, ela fica parada. Respeita a preferência por menos movimento e tem
// bolinhas para escolher a foto. `classeDasFotos` vai só nas fotos (para
// aplicar a máscara que mistura a foto com o fundo), não nas bolinhas.
export default function HeroCarousel({
  midia,
  classeDasFotos = "",
}: {
  midia: Foto[];
  classeDasFotos?: string;
}) {
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
      <div className={`absolute inset-0 ${classeDasFotos}`}>
        {midia.map((item, indice) => (
          <div
            key={item.url}
            aria-hidden={indice !== atual}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              indice === atual ? "opacity-100" : "opacity-0"
            }`}
          >
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
                sizes="(min-width: 768px) 62vw, 100vw"
                priority={indice === 0}
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {midia.length > 1 && (
        <div
          role="group"
          aria-label="Escolher foto"
          className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2"
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
                  ? "w-6 bg-primary"
                  : "w-2.5 bg-surface/85 hover:bg-surface"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
