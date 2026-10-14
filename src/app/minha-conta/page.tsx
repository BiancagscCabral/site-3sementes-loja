import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { usuarioAtual } from "@/lib/supabase/servidor";
import RepetirPedido from "@/components/RepetirPedido";
import Sair from "@/components/Sair";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  AWAITING_CONTACT: "Aguardando contato",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

function quando(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

export default async function MinhaContaPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");

  // Pedidos feitos com a conta aberta, mais os que ela fez antes de ter conta
  // e que foram identificados pelo mesmo e-mail.
  const pedidos = await prisma.order.findMany({
    where: {
      OR: [
        { customerUserId: usuario.id },
        usuario.email ? { customerEmail: usuario.email } : { id: "" },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              name: true,
              priceCents: true,
              category: { select: { slug: true } },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-baseline gap-4 border-b-2 border-foreground pb-2.5">
        <h1 className="text-[15px] font-bold uppercase tracking-[0.18em]">
          Meus pedidos
        </h1>
        <span className="text-[13px] text-muted">{usuario.email}</span>
        <div className="ml-auto">
          <Sair destino="/entrar" />
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm leading-7 text-muted">
            Você ainda não tem pedidos por aqui. Se já comprou com a gente antes
            de criar a conta, use o mesmo e-mail que passou no pedido que eles
            aparecem automaticamente.
          </p>
          <Link
            href="/#catalogo"
            className="mt-6 inline-flex h-11 items-center bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Ver o catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-7 flex flex-col gap-4">
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="border border-border p-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-lg font-bold">
                  {pedido.code}
                </span>
                <span className="border border-border px-2 py-0.5 text-[12px] text-muted">
                  {STATUS[pedido.status] ?? pedido.status}
                </span>
                <span className="text-[13px] text-muted">
                  {quando(pedido.createdAt)}
                </span>
                <span className="ml-auto text-lg font-bold">
                  {formatPriceCents(pedido.totalCents)}
                </span>
              </div>

              <ul className="mt-3 text-[13px] leading-6 text-muted">
                {pedido.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.productName}
                    {item.variantName ? ` (${item.variantName})` : ""}
                  </li>
                ))}
              </ul>

              {pedido.shippingService && (
                <p className="mt-1.5 text-[13px] text-muted">
                  Entrega: {pedido.shippingService}
                  {pedido.shippingCents != null
                    ? `, ${formatPriceCents(pedido.shippingCents)}`
                    : ", a combinar"}
                </p>
              )}

              <div className="mt-4">
                <RepetirPedido
                  itens={pedido.items.map((item) => ({
                    slug: item.product.slug,
                    name: item.product.name,
                    priceCents: item.product.priceCents,
                    quantity: item.quantity,
                    categorySlug: item.product.category.slug,
                    variantName: item.variantName,
                    size: item.size,
                    image: item.product.images[0]?.url,
                  }))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
