"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BannerSlide } from "@/lib/banner";

const INTERVAL_MS = 5000;

const TONES: Record<
  BannerSlide["tone"],
  {
    bg: string;
    eyebrow: string;
    title: string;
    text: string;
    button: string;
    mark: string;
  }
> = {
  olive: {
    bg: "bg-primary-dark",
    eyebrow: "text-accent",
    title: "text-primary-foreground",
    text: "text-primary-foreground/80",
    button: "bg-accent text-accent-foreground",
    mark: "opacity-30",
  },
  sage: {
    bg: "bg-[oklch(72%_0.055_101)]",
    eyebrow: "text-primary-dark",
    title: "text-foreground",
    text: "text-foreground/75",
    button: "bg-primary-dark text-primary-foreground",
    mark: "brightness-0 opacity-10",
  },
  orange: {
    bg: "bg-accent",
    eyebrow: "text-primary-dark",
    title: "text-accent-foreground",
    text: "text-accent-foreground/85",
    button: "bg-primary-dark text-primary-foreground",
    mark: "brightness-0 invert opacity-25",
  },
};

export default function HeroBanner({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, paused, go, slides.length]);

  return (
    <section className="mx-auto max-w-5xl px-6 pt-6">
      <div
        className="relative overflow-hidden rounded-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-roledescription="carrossel"
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const tone = TONES[slide.tone];
            const external = slide.cta.href.startsWith("http");
            return (
              <div
                key={slide.title}
                className={`relative grid h-[380px] w-full shrink-0 grid-cols-1 sm:h-[400px] sm:grid-cols-2 ${tone.bg}`}
                aria-hidden={i !== index}
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${slides.length}`}
              >
                <div className="relative z-10 flex min-w-0 flex-col justify-center px-8 sm:px-14">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${tone.eyebrow}`}
                  >
                    {slide.eyebrow}
                  </span>
                  <h2
                    className={`font-display mt-3 text-3xl font-medium leading-[1.1] tracking-tight sm:text-[42px] ${tone.title}`}
                  >
                    {slide.title}
                  </h2>
                  <p className={`mt-4 max-w-sm text-[15px] leading-7 ${tone.text}`}>
                    {slide.text}
                  </p>
                  <Link
                    href={slide.cta.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    tabIndex={i === index ? 0 : -1}
                    className={`mt-7 inline-flex w-fit items-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${tone.button}`}
                  >
                    {slide.cta.label}
                  </Link>
                </div>

                <div className="absolute inset-0 sm:relative">
                  {slide.image ? (
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 512px"
                      className="object-cover opacity-30 sm:opacity-100"
                      priority={i === 0}
                    />
                  ) : (
                    <div className="hidden h-full items-center justify-center sm:flex">
                      <Image
                        src="/img/logo.png"
                        alt=""
                        width={260}
                        height={260}
                        className={`h-[260px] w-[260px] ${tone.mark}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-surface" : "w-2 bg-surface/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
