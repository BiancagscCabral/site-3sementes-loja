import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/catalog";
import AcompanhaPagamento from "@/components/AcompanhaPagamento";
import { sincronizarPagamento } from "@/lib/sincronizar-pagamento";
import { andamentoDoPedido } from "@/lib/andamento-do-pedido";
import AndamentoDoPedido from "@/components/AndamentoDoPedido";

export const dynamic = "force-dynamic";

// Para onde a InfinitePay manda a cliente depois do pagamento. O endereço não
// prova nada: o que vale é o que a consulta à InfinitePay disser.
export default async function PedidoPage(props: PageProps<"/pedido/[code]">) {
  const { code } = await props.params;
  const codigo = code.toUpperCase();

  // Antes de mostrar a página, pergunta à InfinitePay se o pagamento entrou.
  //
  // É isto que faz a página mudar sozinha mesmo quando o aviso da InfinitePay
  // não chega: ela recarrega de poucos em poucos segundos enquanto a cliente
  // espera, e a cada recarga a resposta é conferida na fonte. A função sabe
  // quando não vale consultar (pedido pago, de WhatsApp, velho, ou consultado
  // agora há pouco), então chamar sempre sai barato.
  //
  // Nunca derruba a página: se a InfinitePay estiver fora do ar, a cliente vê
  // o pedido do jeito que está em vez de um erro.
  try {
    await sincronizarPagamento(codigo);
  } catch (erro) {
    console.error("[pedido] não deu para conferir o pagamento:", erro);
  }

  const pedido = await prisma.order.findUnique({
    where: { code: codigo },
    include: { items: true },
  });

  if (!pedido) notFound();

  const pago = pedido.paymentStatus === "PAID";
  // Só acompanha enquanto há pagamento a esperar: pedido fechado pelo WhatsApp
  // ou cancelado não tem o que aguardar.
  const aguardando = pedido.status === "AWAITING_PAYMENT" && !pago;
  const cancelado = pedido.status === "CANCELLED";
  const andamento = andamentoDoPedido(pedido);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <span className="text-[13px] uppercase tracking-[0.18em] text-muted">
        Pedido {pedido.code}
      </span>

      <h1 className="font-display mt-2 text-[28px] font-semibold leading-tight text-primary sm:text-[34px]">
        {cancelado
          ? "Pedido cancelado"
          : pago
            ? "Pagamento confirmado!"
            : "Recebemos seu pedido"}
      </h1>

      {cancelado && (
        <p className="mt-3 text-base leading-7 text-muted">
          Este pedido foi cancelado. Se não foi você que pediu o cancelamento,
          chame a gente no WhatsApp que a gente resolve.
        </p>
      )}

      {aguardando && (
        <p className="mt-3 text-base leading-7 text-muted">
          Assim que o pagamento for confirmado, esta página muda sozinha. Se
          você acabou de pagar, pode levar um minutinho.
        </p>
      )}

      {aguardando && <AcompanhaPagamento codigo={pedido.code} />}

      {andamento && <AndamentoDoPedido etapas={andamento.etapas} />}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
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
          className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary-dark"
        >
          Falar no WhatsApp
        </a>
        <Link
          href="/minha-conta"
          className="inline-flex h-11 items-center rounded-full border border-primary px-6 text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          Meus pedidos
        </Link>
      </div>
    </div>
  );
}
