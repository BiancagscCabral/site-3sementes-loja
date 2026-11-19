import { prisma } from "@/lib/prisma";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import BarraDoAdmin from "@/components/BarraDoAdmin";

// Todo o painel ganha a mesma barra do topo. A lista de produtos só é buscada
// para quem é administrador: quem não está logado (ou não tem permissão) vê
// só a marca.
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const usuario = await usuarioAtual();
  const logado = ehAdmin(usuario?.email);

  const produtos = logado
    ? (
        await prisma.product.findMany({
          orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
          select: {
            slug: true,
            name: true,
            category: { select: { name: true } },
            _count: { select: { images: true } },
          },
        })
      ).map((produto) => ({
        slug: produto.slug,
        nome: produto.name,
        categoria: produto.category.name,
        temFoto: produto._count.images > 0,
      }))
    : [];

  return (
    <>
      <BarraDoAdmin logado={logado} produtos={produtos} />
      {children}
    </>
  );
}
