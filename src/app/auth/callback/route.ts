import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Para onde o link do e-mail devolve a cliente.
//
// O Supabase não entrega a sessão pronta: ele manda de volta um código de uso
// único, que precisa ser trocado aqui no servidor pelos cookies de login. Sem
// esta rota, a pessoa clica no link, chega sem sessão e é devolvida para a tela
// de entrar — parecendo que o link não funcionou.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const destino = url.searchParams.get("next") ?? "/minha-conta";

  // A origem precisa vir da configuração: atrás da Vercel, o endereço que
  // chega na requisição é interno, não o domínio da loja.
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? url.origin).replace(
    /\/$/,
    "",
  );

  const supabase = await criarClienteServidor();

  // Fluxo novo (PKCE): vem um "code".
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${site}${destino}`);
    console.error("[auth/callback] troca do code falhou:", error.message);
    return NextResponse.redirect(`${site}/entrar?erro=link`);
  }

  // Fluxo antigo, ainda usado por alguns modelos de e-mail: token_hash + type.
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type");
  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({
      type: tipo as "email" | "recovery" | "invite" | "magiclink" | "signup",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${site}${destino}`);
    console.error("[auth/callback] verificacao falhou:", error.message);
    return NextResponse.redirect(`${site}/entrar?erro=link`);
  }

  return NextResponse.redirect(`${site}/entrar?erro=link`);
}
