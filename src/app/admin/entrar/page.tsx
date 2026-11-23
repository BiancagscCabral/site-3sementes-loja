"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import CartaoDeAcesso from "@/components/admin/CartaoDeAcesso";
import CampoDoFormulario from "@/components/admin/CampoDoFormulario";
import { IconeCadeado, IconeEmail, IconeSeta } from "@/components/Icones";

type ErroSupabase = { code?: string; status?: number; message?: string };

// O Supabase devolve o motivo em código; sem traduzir, a tela mente sobre o
// que aconteceu.
function explicar(error: ErroSupabase) {
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "Limite de e-mails do Supabase atingido (2 por hora no plano grátis). Espere alguns minutos e tente de novo.";
  }
  if (error.code === "user_already_exists" || error.code === "email_exists") {
    return 'Esse e-mail já tem conta. Use "Esqueci minha senha".';
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

  const recuperarSenha = async () => {
    if (!email.trim()) {
      setErro("Escreva seu e-mail primeiro.");
      return;
    }
    setErro(null);
    setCarregando(true);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/nova-senha`,
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
    <CartaoDeAcesso
      titulo="Painel da loja"
      subtitulo="Acesso restrito. Entre com o e-mail da loja."
    >
      <form onSubmit={entrar} className="mt-7 flex flex-col gap-4">
        <CampoDoFormulario
          rotulo="E-mail"
          Icone={IconeEmail}
          tipo="email"
          valor={email}
          aoMudar={setEmail}
          autoComplete="email"
        />
        <CampoDoFormulario
          rotulo="Senha"
          Icone={IconeCadeado}
          tipo="password"
          valor={senha}
          aoMudar={setSenha}
          autoComplete="current-password"
        />

        {erro && <p className="text-[13px] text-danger">{erro}</p>}
        {aviso && <p className="text-[13px] text-muted">{aviso}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-1 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-[16px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {carregando ? "Aguarde..." : "Entrar"}
          {!carregando && <IconeSeta className="h-[18px] w-[18px]" />}
        </button>

        <button
          type="button"
          onClick={recuperarSenha}
          className="cursor-pointer self-center text-[14px] text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          Esqueci minha senha
        </button>
      </form>
    </CartaoDeAcesso>
  );
}
