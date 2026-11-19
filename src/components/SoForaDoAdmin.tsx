"use client";

import { usePathname } from "next/navigation";

// O painel tem a própria barra do topo e não precisa do rodapé da loja:
// dentro de /admin o cabeçalho e o rodapé do site simplesmente não aparecem.
export default function SoForaDoAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const caminho = usePathname();
  if (caminho === "/admin" || caminho.startsWith("/admin/")) return null;
  return <>{children}</>;
}
