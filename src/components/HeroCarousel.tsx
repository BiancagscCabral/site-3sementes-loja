"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroMedia } from "@/lib/hero";

const SEGUNDOS = 6;

// Fundo do topo da home: as fotos e os vídeos se alternam em transição suave,
// atrás do texto. Com um arquivo só, ele fica parado — sem contador rodando à toa.
export default function HeroCarousel({ midia }: { midia: HeroMedia[] }) {
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (midia.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setAtual((indice) => (indice + 1) % midia.length);
    }, SEGUNDOS * 1000);

    return () => clearInterval(timer);
  }, [midia.length]);

  if (midia.length === 0) return null;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-hero">
      {midia.map((item, indice) => (
        <div
          key={item.url}
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
              alt=""
              fill
              sizes="100vw"
              priority={indice === 0}
              className="object-cover"
            />
          )}
        </div>
      ))}

      {/* Escurece o fundo o suficiente para o bloco de texto não competir com a foto */}
      <div className="absolute inset-0 bg-foreground/35" />
    </div>
  );
}
