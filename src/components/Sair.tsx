"use client";

import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

export default function Sair({ destino = "/admin/entrar" }: { destino?: string }) {
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
      className="text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-foreground"
    >
      Sair
    </button>
  );
}
