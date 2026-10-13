"use client";

import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

export default function Sair() {
  const router = useRouter();

  const sair = async () => {
    await criarClienteNavegador().auth.signOut();
    router.replace("/admin/entrar");
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
