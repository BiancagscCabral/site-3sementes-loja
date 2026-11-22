"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addItem } from "@/lib/cart";
import { IconeSacola } from "@/components/Icones";

const ESTILO =
  "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark";

// Botão do card. Peça sem cor nem tamanho para escolher entra direto na sacola;
// as outras levam à página do produto, onde a escolha é feita.
export default function BotaoAdicionar({
  slug,
  name,
  priceCents,
  categorySlug,
  image,
  temOpcoes,
}: {
  slug: string;
  name: string;
  priceCents: number;
  categorySlug: string;
  image?: string;
  temOpcoes: boolean;
}) {
  const [adicionado, setAdicionado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (temOpcoes) {
    return (
      <Link href={`/produtos/${slug}`} className={ESTILO}>
        Escolher opções
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={ESTILO}
      onClick={() => {
        addItem({ slug, name, priceCents, quantity: 1, categorySlug, image });
        setAdicionado(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdicionado(false), 1800);
      }}
    >
      <IconeSacola className="h-4 w-4" />
      <span aria-live="polite">
        {adicionado ? "Adicionado!" : "Adicionar ao carrinho"}
      </span>
    </button>
  );
}
