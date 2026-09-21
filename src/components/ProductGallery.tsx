"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = { url: string; altText: string | null };

function Placeholder({
  size,
  logo,
  markClass,
}: {
  size: number;
  logo: string;
  markClass: string;
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, var(--secondary), transparent 62%)",
        }}
      />
      <Image
        src={logo}
        alt=""
        width={size}
        height={size}
        className={`relative ${markClass}`}
      />
    </>
  );
}

export default function ProductGallery({
  images,
  logo,
  markClass,
}: {
  images: GalleryImage[];
  logo: string;
  markClass: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface sm:h-[470px]">
        {current ? (
          <Image
            src={current.url}
            alt={current.altText ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover"
            priority
          />
        ) : (
          <>
            <Placeholder size={160} logo={logo} markClass={markClass} />
            <span className="absolute bottom-[18px] left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.14em] text-muted">
              Foto do produto
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1}`}
              className={`relative h-[84px] w-[84px] overflow-hidden rounded-xl bg-surface ${
                index === active
                  ? "border-2 border-accent"
                  : "border border-border"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="84px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
