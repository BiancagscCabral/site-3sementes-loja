import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import BarraDoAdmin from "@/components/BarraDoAdmin";

// Todo o painel ganha a mesma barra do topo. Quem não está logado (ou não
// tem permissão) vê só a marca.
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const usuario = await usuarioAtual();

  return (
    <>
      <BarraDoAdmin logado={ehAdmin(usuario?.email)} />
      {children}
    </>
  );
}
