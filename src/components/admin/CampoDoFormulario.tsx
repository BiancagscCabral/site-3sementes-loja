"use client";

import { useState } from "react";
import { IconeOlho } from "@/components/Icones";

// Campo do formulário de acesso: rótulo com ícone em cima e caixa arredondada.
// Campo de senha ganha o olho que mostra e esconde o que foi digitado.
export default function CampoDoFormulario({
  rotulo,
  Icone,
  tipo,
  valor,
  aoMudar,
  autoComplete,
}: {
  rotulo: string;
  Icone: (props: { className?: string }) => React.ReactNode;
  tipo: "email" | "password";
  valor: string;
  aoMudar: (texto: string) => void;
  autoComplete: string;
}) {
  const [visivel, setVisivel] = useState(false);
  const ehSenha = tipo === "password";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-[14px] font-medium text-foreground">
        <Icone className="h-[18px] w-[18px]" />
        {rotulo}
      </span>
      <span className="flex h-12 items-center rounded-2xl border border-border bg-background px-4 focus-within:border-primary">
        <input
          type={ehSenha && visivel ? "text" : tipo}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          autoComplete={autoComplete}
          required
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none"
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? "Esconder a senha" : "Mostrar a senha"}
            className="cursor-pointer text-foreground"
          >
            <IconeOlho className="h-5 w-5" />
          </button>
        )}
      </span>
    </label>
  );
}
