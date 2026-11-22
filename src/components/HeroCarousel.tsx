"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroMedia } from "@/lib/hero";

const SEGUNDOS = 6;

type Foto = HeroMedia & { alt?: string };

// Foto do topo da home, dentro de uma forma orgânica. As fotos se alternam em
// transição suave; com uma só, ela fica parada. Respeita a preferência por
// menos movimento e tem bolinhas para escolher a foto.
export default function HeroCarousel({ midia }: { midia: Foto[] }) {
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
    <div>
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[58%_42%_50%_50%/50%_55%_45%_50%] bg-muted-bg shadow-[0_18px_40px_-18px_rgb(73_53_46/0.45)]">
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
                sizes="(min-width: 768px) 460px, 90vw"
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
          className="mt-4 flex justify-center gap-2"
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
                  : "w-2.5 bg-primary/30 hover:bg-primary/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
