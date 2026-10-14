import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import AtualizaSozinho from "@/components/AtualizaSozinho";
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

type Endereco = {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
};

export default async function AdminPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16 sm:px-6">
        <h1 className="font-display text-[26px] font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted">
          Esta conta não tem permissão para ver os pedidos.
        </p>
        <div className="mt-6">
          <Sair />
        </div>
      </div>
    );
  }

  const pedidos = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const deHoje = pedidos.filter((p) => p.createdAt >= hoje);
  const aguardando = pedidos.filter((p) => p.status === "AWAITING_CONTACT");

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <AtualizaSozinho segundos={30} />

      <div className="flex flex-wrap items-baseline gap-4 border-b-2 border-foreground pb-2.5">
        <h1 className="text-[15px] font-bold uppercase tracking-[0.18em]">
          Pedidos
        </h1>
        <span className="text-[13px] text-muted">
          atualiza sozinho a cada 30s
        </span>
        <div className="ml-auto">
          <Sair />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-border p-4">
          <span className="block text-[13px] text-muted">Hoje</span>
          <span className="font-display text-2xl font-bold">
            {deHoje.length}
          </span>
        </div>
        <div className="border border-border p-4">
          <span className="block text-[13px] text-muted">
            Aguardando contato
          </span>
          <span className="font-display text-2xl font-bold">
            {aguardando.length}
          </span>
        </div>
        <div className="border border-border p-4">
          <span className="block text-[13px] text-muted">Últimos 100</span>
          <span className="font-display text-2xl font-bold">
            {pedidos.length}
          </span>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          Nenhum pedido ainda. Quando alguém finalizar uma compra no site, ele
          aparece aqui na hora.
        </p>
      ) : (
        <ul className="mt-7 flex flex-col gap-4">
          {pedidos.map((pedido) => {
            const endereco = (pedido.shippingAddress ?? {}) as Endereco;
            return (
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

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="text-[13px] leading-6 text-muted">
                    <span className="block font-medium text-foreground">
                      {pedido.customerName}
                    </span>
                    <a
                      href={`https://wa.me/55${pedido.customerPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      {pedido.customerPhone}
                    </a>
                    {pedido.customerEmail && <span className="block">{pedido.customerEmail}</span>}
                    <span className="mt-1.5 block">
                      {endereco.rua}, {endereco.numero}
                      {endereco.complemento ? ` - ${endereco.complemento}` : ""}
                      <br />
                      {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                      <br />
                      CEP {endereco.cep}
                    </span>
                  </div>

                  <div className="text-[13px] leading-6 text-muted">
                    <ul>
                      {pedido.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.productName}
                          {item.variantName ? ` (${item.variantName})` : ""} —{" "}
                          {formatPriceCents(item.unitPriceCents * item.quantity)}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-1.5 block">
                      Entrega:{" "}
                      {pedido.shippingService ?? "não escolhida"}
                      {pedido.shippingCents != null
                        ? `, ${formatPriceCents(pedido.shippingCents)}`
                        : pedido.deliveryMethod === "uber-flash"
                          ? ", a combinar"
                          : ""}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
