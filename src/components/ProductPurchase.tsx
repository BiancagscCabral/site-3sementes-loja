"use client";

import { useState } from "react";
import { getWhatsAppUrl } from "@/lib/catalog";
import { formatPriceCents } from "@/lib/format";

type Variant = {
  id: string;
  name: string;
  priceCents: number | null;
  stock: number;
};

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

export default function ProductPurchase({
  productName,
  priceCents,
  variants,
  stock,
}: {
  productName: string;
  priceCents: number;
  variants: Variant[];
  stock: number;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const variant = variants.find((v) => v.id === variantId);
  const activePriceCents = variant?.priceCents ?? priceCents;
  const availableStock = variant ? variant.stock : stock;

  const message = [
    `Olá! Tenho interesse em: ${productName}`,
    variant ? `Opção: ${variant.name}` : null,
    quantity > 1 ? `Quantidade: ${quantity}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <div className="mt-3.5 flex items-baseline gap-3">
        <span className="text-[30px] font-semibold text-accent">
          {formatPriceCents(activePriceCents)}
        </span>
        <span className="text-[13px] text-muted">
          peça única, feita à mão
        </span>
      </div>

      {variants.length > 0 && (
        <div className="mt-6 flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold">Opções</span>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setVariantId(option.id)}
                className={`rounded-full px-[18px] py-[9px] text-sm transition-colors ${
                  option.id === variantId
                    ? "border border-primary bg-secondary font-semibold text-secondary-foreground"
                    : "border border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
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
        {availableStock > 0 && (
          <span className="text-[13px] text-muted">
            {availableStock === 1
              ? "1 peça pronta em estoque"
              : `${availableStock} peças prontas em estoque`}
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
          disabled
          className="flex h-[54px] cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border text-[15px] font-medium text-muted"
        >
          Adicionar à sacola
          <span className="text-xs uppercase tracking-[0.12em]">em breve</span>
        </button>
      </div>
    </>
  );
}
