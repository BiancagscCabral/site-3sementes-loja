"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { getWhatsAppUrl, priceForSize, SIZE_GUIDE } from "@/lib/catalog";
import { formatPriceCents } from "@/lib/format";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-[19px] w-[19px]"
    >
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8.9 19L4 20Z" strokeLinejoin="round" />
      <path
        d="M8.5 9.3c.2 2.5 2.7 5 5.2 5.2.9.1 1.3-.7 1-1.3l-.6-1.2-1.6.4c-.8-.5-1.5-1.2-2-2l.4-1.6-1.2-.6c-.6-.3-1.3.1-1.2 1.1Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-w-[52px] rounded-full px-[18px] py-[9px] text-sm transition-colors ${
        selected
          ? "border border-primary bg-secondary font-semibold text-secondary-foreground"
          : "border border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export default function ProductPurchase({
  image,
  productName,
  productSlug,
  categorySlug,
  priceCents,
  sizes = [],
  colors = [],
  stock,
}: {
  image?: string;
  productName: string;
  productSlug: string;
  categorySlug: string;
  priceCents: number;
  sizes?: string[];
  colors?: string[];
  stock: number;
}) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [erro, setErro] = useState(false);

  const precoAtual = priceForSize(priceCents, size);
  const escolhas = [color, size].filter(Boolean).join(" · ");

  const message = [
    `Olá! Tenho interesse em: ${productName}`,
    escolhas ? `Opção: ${escolhas}` : null,
    quantity > 1 ? `Quantidade: ${quantity}` : null,
    `Valor: ${formatPriceCents(precoAtual * quantity)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const adicionar = () => {
    if (sizes.length > 0 && !size) {
      setErro(true);
      return;
    }
    addItem({
      slug: productSlug,
      name: productName,
      priceCents: precoAtual,
      quantity,
      categorySlug,
      image,
      variantName: escolhas || undefined,
    });
    setAdded(true);
  };

  return (
    <>
      <div className="mt-3.5">
        <span className="text-[30px] font-semibold text-accent">
          {formatPriceCents(precoAtual)}
        </span>
      </div>

      {colors.length > 0 && (
        <div className="mt-6 flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold">Cor</span>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((option) => (
              <OptionButton
                key={option}
                label={option}
                selected={option === color}
                onClick={() => setColor(option)}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold">Tamanho</span>
            <span className="text-[12px] text-muted">
              {size ? SIZE_GUIDE[size] : "Meça a circunferência do braço"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((option) => (
              <OptionButton
                key={option}
                label={option}
                selected={option === size}
                onClick={() => {
                  setSize(option);
                  setErro(false);
                }}
              />
            ))}
          </div>
          {erro && (
            <span className="text-[12px] text-danger">
              Escolha o tamanho antes de adicionar.
            </span>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3.5">
        <div className="flex items-center overflow-hidden rounded-full border border-border bg-surface">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="flex h-[46px] w-11 items-center justify-center text-lg text-muted transition-colors hover:text-foreground"
          >
            &minus;
          </button>
          <span className="w-[34px] text-center text-[15px] font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Aumentar quantidade"
            className="flex h-[46px] w-11 items-center justify-center text-lg text-muted transition-colors hover:text-foreground"
          >
            +
          </button>
        </div>
        {stock > 0 && (
          <span className="text-[13px] text-muted">
            {stock === 1
              ? "1 peça pronta em estoque"
              : `${stock} peças prontas em estoque`}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <a
          href={getWhatsAppUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[54px] items-center justify-center gap-2.5 rounded-full bg-accent text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon />
          Comprar pelo WhatsApp
        </a>
        <button
          type="button"
          onClick={adicionar}
          className="flex h-[54px] items-center justify-center rounded-full border border-primary text-[15px] font-medium text-primary transition-colors hover:bg-secondary"
        >
          Adicionar à sacola
        </button>
        {added && (
          <p className="text-center text-[13px] text-muted">
            Adicionado.{" "}
            <Link
              href="/carrinho"
              className="text-accent underline underline-offset-4"
            >
              Ver sacola
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
