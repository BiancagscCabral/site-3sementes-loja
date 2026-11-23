"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import CartaoDeAcesso from "@/components/admin/CartaoDeAcesso";
import CampoDoFormulario from "@/components/admin/CampoDoFormulario";
import { IconeCadeado, IconeSeta } from "@/components/Icones";

// Tela aberta pelo link que o Supabase manda por e-mail. O link já deixa a
// pessoa autenticada; aqui ela só define a senha nova.
export default function NovaSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [repetida, setRepetida] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);

    if (senha.length < 8) {
      setErro("A senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (senha !== repetida) {
      setErro("As duas senhas não são iguais.");
      return;
    }

    setCarregando(true);
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (error) {
      setErro("O link expirou. Peça outro na tela de entrar.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <CartaoDeAcesso
      titulo="Criar senha"
      subtitulo="Escolha a senha de acesso ao painel."
    >
      <form onSubmit={salvar} className="mt-7 flex flex-col gap-4">
        <CampoDoFormulario
          rotulo="Nova senha"
          Icone={IconeCadeado}
          tipo="password"
          valor={senha}
          aoMudar={setSenha}
          autoComplete="new-password"
        />
        <CampoDoFormulario
          rotulo="Repita a senha"
          Icone={IconeCadeado}
          tipo="password"
          valor={repetida}
          aoMudar={setRepetida}
          autoComplete="new-password"
        />

        {erro && <p className="text-[13px] text-danger">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-1 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-[16px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Salvar senha"}
          {!carregando && <IconeSeta className="h-[18px] w-[18px]" />}
        </button>
      </form>
    </CartaoDeAcesso>
  );
}
