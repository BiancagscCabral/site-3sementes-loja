import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import { pedidoExpirou } from "@/lib/regras-pedido";
import { sincronizarPagamento } from "@/lib/sincronizar-pagamento";
import AtualizaSozinho from "@/components/AtualizaSozinho";
import Sair from "@/components/Sair";
import CabecalhoDoPainel from "@/components/admin/CabecalhoDoPainel";
import ListaDePedidos, {
  type PedidoDaLista,
} from "@/components/admin/ListaDePedidos";
import { IconeBarras, IconeCaminhao, IconeSacola } from "@/components/Icones";

export const dynamic = "force-dynamic";

type Endereco = {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
};

function data(valor: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(valor);
}

export default async function AdminPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16 sm:px-6">
        <h1 className="font-display text-[26px] font-semibold text-primary">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-muted">
          Esta conta não tem permissão para ver os pedidos.
        </p>
        <div className="mt-6">
          <Sair />
        </div>
      </div>
    );
  }

  // Confere na InfinitePay os pedidos que ainda esperam pagamento, antes de
  // montar a tela. Assim o painel descobre o pagamento sozinho, sem depender
  // nem do aviso da InfinitePay nem de a cliente abrir a página dela.
  //
  // São poucos: só os não pagos das últimas horas, e a função ignora o que
  // consultou agora há pouco. Erro aqui não derruba o painel.
  const esperandoPagamento = await prisma.order.findMany({
    where: { status: "AWAITING_PAYMENT", paymentStatus: "PENDING" },
    select: { code: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  await Promise.all(
    esperandoPagamento.map((pedido) =>
      sincronizarPagamento(pedido.code).catch((erro) => {
        console.error(`[admin] ${pedido.code}:`, erro);
      }),
    ),
  );

  const todos = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: true,
      events: { select: { status: true, origem: true, createdAt: true } },
    },
  });

  // Carrinho que chegou no pagamento e não voltou sai da tela: acumulado, ele
  // esconde o pedido que importa. Continua no banco, então pagamento atrasado
  // ainda acha o pedido e o traz de volta por si.
  const pedidos = todos.filter((pedido) => !pedidoExpirou(pedido));

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const deHoje = pedidos.filter((p) => p.createdAt >= hoje).length;
  const aguardando = pedidos.filter(
    (p) => p.status === "AWAITING_CONTACT",
  ).length;

  const lista: PedidoDaLista[] = pedidos.map((pedido) => {
    const endereco = (pedido.shippingAddress ?? {}) as Endereco;
    return {
      id: pedido.id,
      codigo: pedido.code,
      status: pedido.status,
      foiPago: pedido.paymentStatus === "PAID",
      expirou: pedidoExpirou(pedido),
      data: data(pedido.createdAt),
      valor: formatPriceCents(pedido.totalCents),
      cliente: pedido.customerName,
      telefone: pedido.customerPhone,
      email: pedido.customerEmail,
      endereco: [
        `${endereco.rua ?? ""}, ${endereco.numero ?? ""}${
          endereco.complemento ? ` - ${endereco.complemento}` : ""
        }`,
        `${endereco.bairro ?? ""} - ${endereco.cidade ?? ""}/${endereco.estado ?? ""}`,
        `CEP ${endereco.cep ?? ""}`,
      ],
      itens: pedido.items.map(
        (item) =>
          `${item.quantity}x ${item.productName}${
            item.variantName ? ` (${item.variantName})` : ""
          }: ${formatPriceCents(item.unitPriceCents * item.quantity)}`,
      ),
      rastreio: pedido.tracking,
      historico: pedido.events,
      entrega: `Entrega: ${pedido.shippingService ?? "não escolhida"}${
        pedido.shippingCents != null
          ? `, ${formatPriceCents(pedido.shippingCents)}`
          : pedido.deliveryMethod === "uber-flash"
            ? ", a combinar"
            : ""
      }`,
    };
  });

  const resumo = [
    {
      rotulo: "Hoje",
      valor: deHoje,
      Icone: IconeSacola,
      fundo: "bg-rose/40",
    },
    {
      rotulo: "Aguardando contato",
      valor: aguardando,
      Icone: IconeCaminhao,
      fundo: "bg-sun/40",
    },
    {
      rotulo: "Últimos 100",
      valor: pedidos.length,
      Icone: IconeBarras,
      fundo: "bg-rose/40",
    },
  ];

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10">
      <AtualizaSozinho segundos={30} />

      <CabecalhoDoPainel
        titulo="Pedidos"
        subtitulo="Acompanhe e gerencie os pedidos da sua loja."
      />

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {resumo.map(({ rotulo, valor, Icone, fundo }) => (
          <li
            key={rotulo}
            className={`flex items-center gap-5 rounded-2xl px-6 py-5 ${fundo}`}
          >
            <Icone className="h-11 w-11 shrink-0 text-primary" />
            <span>
              <span className="block text-[14px] text-foreground">
                {rotulo}
              </span>
              <span className="block font-display text-[34px] font-semibold leading-none text-foreground">
                {valor}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <ListaDePedidos pedidos={lista} />
    </div>
  );
}
