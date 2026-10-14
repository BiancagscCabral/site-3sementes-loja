import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Para onde a InfinitePay manda a cliente depois do pagamento. O endereço não
// prova nada: o que vale é o que o webhook já confirmou no banco.
export default async function PedidoPage(props: PageProps<"/pedido/[code]">) {
  const { code } = await props.params;

  const pedido = await prisma.order.findUnique({
    where: { code: code.toUpperCase() },
    include: { items: true },
  });

  if (!pedido) notFound();

  const pago = pedido.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <span className="text-[13px] uppercase tracking-[0.18em] text-muted">
        Pedido {pedido.code}
      </span>

      <h1 className="font-display mt-2 text-[28px] font-bold leading-tight text-foreground sm:text-[32px]">
        {pago ? "Pagamento confirmado!" : "Recebemos seu pedido"}
      </h1>

      <p className="mt-3 text-base leading-7 text-muted">
        {pago
          ? "Já estamos preparando sua encomenda. Você recebe o código de rastreio assim que ela for postada."
          : "Assim que o pagamento for confirmado, esta página muda sozinha. Se você acabou de pagar, pode levar um minutinho."}
      </p>

      <div className="mt-8 border border-border p-5">
        <ul className="flex flex-col gap-2 text-[15px]">
          {pedido.items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="flex-1 text-muted">
                {item.quantity}x {item.productName}
                {item.variantName ? ` (${item.variantName})` : ""}
              </span>
              <span className="font-medium text-foreground">
                {formatPriceCents(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        {pedido.shippingService && (
          <div className="mt-3 flex gap-3 border-t border-border pt-3 text-[15px]">
            <span className="flex-1 text-muted">
              Entrega: {pedido.shippingService}
            </span>
            <span className="font-medium text-foreground">
              {pedido.shippingCents != null
                ? formatPriceCents(pedido.shippingCents)
                : "a combinar"}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-[13px] text-muted">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatPriceCents(pedido.totalCents)}
          </span>
        </div>
      </div>

      <p className="mt-6 text-[13px] leading-6 text-muted">
        Guarde o código <strong>{pedido.code}</strong>. É por ele que a gente
        acha seu pedido.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Falar no WhatsApp
        </a>
        <Link
          href="/minha-conta"
          className="inline-flex h-11 items-center border border-primary px-6 text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          Meus pedidos
        </Link>
      </div>
    </div>
  );
}
