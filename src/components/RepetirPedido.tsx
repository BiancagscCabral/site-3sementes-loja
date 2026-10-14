"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addItem } from "@/lib/cart";

export type ItemRepetido = {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  categorySlug: string;
  variantName: string | null;
  size: string | null;
  image?: string;
};

// Joga as peças do pedido antigo de volta na sacola. O preço vem do produto
// hoje, não do que foi pago na época: se mudou, a cliente vê o valor atual.
export default function RepetirPedido({ itens }: { itens: ItemRepetido[] }) {
  const router = useRouter();
  const [feito, setFeito] = useState(false);

  const repetir = () => {
    for (const item of itens) {
      addItem({
        slug: item.slug,
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
        categorySlug: item.categorySlug,
        variantName: item.variantName ?? undefined,
        size: item.size,
        image: item.image,
      });
    }
    setFeito(true);
    router.push("/carrinho");
  };

  return (
    <button
      type="button"
      onClick={repetir}
      disabled={feito}
      className="border border-primary px-4 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-secondary disabled:opacity-60"
    >
      {feito ? "Indo pra sacola..." : "Pedir de novo"}
    </button>
  );
}
