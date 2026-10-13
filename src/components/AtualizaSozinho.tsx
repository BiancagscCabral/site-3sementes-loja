"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Recarrega os dados da página de tempos em tempos, para o painel mostrar
// pedido novo sem ninguém apertar nada.
export default function AtualizaSozinho({ segundos }: { segundos: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, segundos * 1000);
    return () => clearInterval(timer);
  }, [router, segundos]);

  return null;
}
