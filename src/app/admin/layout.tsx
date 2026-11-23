import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import MenuDoAdmin from "@/components/admin/MenuDoAdmin";

// O painel usa a paleta da loja. Quem está logada como administradora vê o
// menu lateral; as telas de entrar e de nova senha aparecem sozinhas, no
// centro, sem menu.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const usuario = await usuarioAtual();
  const logado = ehAdmin(usuario?.email);

  return (
    <div className="tema-painel min-h-screen bg-background text-foreground lg:flex">
      {logado && <MenuDoAdmin />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
