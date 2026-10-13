"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

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
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-6">
      <h1 className="font-display text-[26px] font-bold text-foreground">
        Criar senha
      </h1>

      <form onSubmit={salvar} className="mt-7 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Nova senha
          </span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            required
            className="h-11 border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Repita a senha
          </span>
          <input
            type="password"
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            autoComplete="new-password"
            required
            className="h-11 border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>

        {erro && <p className="text-[13px] text-danger">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="flex h-11 items-center justify-center bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Salvar senha"}
        </button>
      </form>
    </div>
  );
}
