"use client";

import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

// Entrada da cliente: ela digita o e-mail e recebe um link que a conecta.
// Sem senha para guardar, sem senha para esquecer.
export default function EntrarClientePage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const enviarLink = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/minha-conta`,
      },
    });

    setCarregando(false);
    if (error) {
      setErro(
        error.status === 429
          ? "Muitas tentativas seguidas. Espere alguns minutos."
          : "Não deu para enviar o link agora. Tente de novo em instantes.",
      );
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16 sm:px-6">
        <h1 className="font-display text-[26px] font-bold text-foreground">
          Olha seu e-mail
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Mandamos um link para <strong>{email}</strong>. Abra o e-mail e clique
          nele para entrar — não precisa de senha.
        </p>
        <p className="mt-3 text-[13px] leading-6 text-muted">
          Não chegou? Dê uma olhada no spam e, se não estiver lá,{" "}
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="underline underline-offset-4"
          >
            tente outro e-mail
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-6">
      <h1 className="font-display text-[26px] font-bold text-foreground">
        Minha conta
      </h1>
      <p className="mt-2 text-sm leading-7 text-muted">
        Digite seu e-mail e a gente manda um link de acesso. Lá você acompanha
        seus pedidos e repete uma compra em dois cliques.
      </p>

      <form onSubmit={enviarLink} className="mt-7 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="h-11 border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </label>

        {erro && <p className="text-[13px] text-danger">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="flex h-11 items-center justify-center bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {carregando ? "Enviando..." : "Receber link de acesso"}
        </button>

        <p className="text-[13px] leading-6 text-muted">
          Não precisa criar conta antes: se for seu primeiro acesso, ela é criada
          na hora.
        </p>
      </form>
    </div>
  );
}
