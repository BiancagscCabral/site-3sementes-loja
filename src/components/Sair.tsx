"use client";

import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

const ESTILO_PADRAO =
  "cursor-pointer text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-foreground";

export default function Sair({
  destino = "/admin/entrar",
  className = ESTILO_PADRAO,
}: {
  destino?: string;
  className?: string;
}) {
  const router = useRouter();

  const sair = async () => {
    await criarClienteNavegador().auth.signOut();
    router.replace(destino);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={sair}
      className={className}
    >
      Sair
    </button>
  );
}
