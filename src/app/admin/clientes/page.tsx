import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import CabecalhoDoPainel from "@/components/admin/CabecalhoDoPainel";
import ListaDeClientes, {
  type ClienteDaLista,
} from "@/components/admin/ListaDeClientes";

export const dynamic = "force-dynamic";

function data(valor: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(valor);
}

// Não existe tabela de clientes: quem comprou fica nos pedidos. Aqui os
// pedidos são agrupados por e-mail (ou, sem e-mail, pelo telefone), e o "total
// pago" soma só o que já foi pago de fato.
export default async function ClientesDoAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) redirect("/admin");

  const pedidos = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      totalCents: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  const grupos = new Map<
    string,
    { cliente: ClienteDaLista; pagoCents: number }
  >();
  for (const pedido of pedidos) {
    const chave = (
      pedido.customerEmail?.trim().toLowerCase() ||
      pedido.customerPhone.replace(/\D/g, "")
    ).toString();
    const grupo = grupos.get(chave);
    const pago = pedido.paymentStatus === "PAID" ? pedido.totalCents : 0;
    if (grupo) {
      grupo.cliente.pedidos += 1;
      grupo.pagoCents += pago;
    } else {
      // Os pedidos vêm do mais novo para o mais antigo: o primeiro de cada
      // cliente é o último pedido dele e traz o nome mais recente.
      grupos.set(chave, {
        pagoCents: pago,
        cliente: {
          chave,
          nome: pedido.customerName,
          email: pedido.customerEmail,
          telefone: pedido.customerPhone,
          pedidos: 1,
          gasto: "",
          ultimoPedido: data(pedido.createdAt),
        },
      });
    }
  }

  const clientes = [...grupos.values()].map(({ cliente, pagoCents }) => ({
    ...cliente,
    gasto: formatPriceCents(pagoCents),
  }));

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10">
      <CabecalhoDoPainel
        titulo="Clientes"
        subtitulo="Quem já comprou na sua loja."
      />
      <ListaDeClientes clientes={clientes} />
    </div>
  );
}
