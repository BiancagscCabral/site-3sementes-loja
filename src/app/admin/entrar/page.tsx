"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

type ErroSupabase = { code?: string; status?: number; message?: string };

// O Supabase devolve o motivo em código; sem traduzir, a tela mente sobre o
// que aconteceu.
function explicar(error: ErroSupabase) {
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "Limite de e-mails do Supabase atingido (2 por hora no plano grátis). Espere alguns minutos e tente de novo.";
  }
  if (error.code === "user_already_exists" || error.code === "email_exists") {
    return "Esse e-mail já tem conta. Use \"Esqueci minha senha\".";
  }
  if (error.code === "email_address_invalid") {
    return "O Supabase recusou esse endereço de e-mail.";
  }
  if (error.code === "weak_password") {
    return "Senha muito fraca. Use pelo menos 8 caracteres.";
  }
  if (error.code === "email_not_confirmed") {
    return "Falta confirmar o e-mail. Abra o link que enviamos para a sua caixa de entrada.";
  }
  return `Não deu para completar: ${error.message ?? "erro desconhecido"}`;
}

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  const entrar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setCarregando(false);
    if (error) {
      setErro(
        error.code === "invalid_credentials"
          ? "E-mail ou senha não conferem."
          : explicar(error),
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  const criarConta = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);
    setAviso(null);

    if (senha.length < 8) {
      setErro("A senha precisa de pelo menos 8 caracteres.");
      return;
    }

    setCarregando(true);
    const supabase = criarClienteNavegador();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);

    if (error) {
      setErro(explicar(error));
      return;
    }
    // Se o projeto exige confirmar o e-mail, ainda não há sessão aberta.
    if (!data.session) {
      setAviso(
        "Enviamos um e-mail de confirmação. Clique no link de lá e depois entre com sua senha.",
      );
      setPrimeiroAcesso(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  const recuperarSenha = async () => {
    if (!email.trim()) {
      setErro("Escreva seu e-mail primeiro.");
      return;
    }
    setErro(null);
    setCarregando(true);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/nova-senha`,
    });

    setCarregando(false);
    if (error) {
      setErro(explicar(error));
      return;
    }
    setAviso(
      "Se esse e-mail tiver conta, o link para criar a senha chega em instantes.",
    );
  };

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-6">
      <h1 className="font-display text-[26px] font-bold text-foreground">
        Painel da loja
      </h1>
      <p className="mt-2 text-sm text-muted">
        Acesso restrito. Entre com o e-mail da loja.
      </p>

      <form
        onSubmit={primeiroAcesso ? criarConta : entrar}
        className="mt-7 flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="h-11 border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={primeiroAcesso ? "new-password" : "current-password"}
            required
            className="h-11 border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>

        {erro && <p className="text-[13px] text-danger">{erro}</p>}
        {aviso && <p className="text-[13px] text-muted">{aviso}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="flex h-11 items-center justify-center bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {carregando
            ? "Aguarde..."
            : primeiroAcesso
              ? "Criar meu acesso"
              : "Entrar"}
        </button>

        <div className="flex flex-col gap-2 text-[13px] text-muted">
          <button
            type="button"
            onClick={() => {
              setPrimeiroAcesso((atual) => !atual);
              setErro(null);
              setAviso(null);
            }}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {primeiroAcesso
              ? "Já tenho senha, quero entrar"
              : "Primeiro acesso: criar minha senha"}
          </button>
          <button
            type="button"
            onClick={recuperarSenha}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Esqueci minha senha
          </button>
        </div>
      </form>
    </div>
  );
}
