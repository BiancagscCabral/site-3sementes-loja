import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente do Supabase para usar em Server Components, rotas de API e actions.
export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaGravar) {
          try {
            for (const { name, value, options } of cookiesParaGravar) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component não pode gravar cookie: quem renova a sessão é
            // o middleware, então aqui dá para ignorar.
          }
        },
      },
    },
  );
}

// Quem está logado agora, ou null.
export async function usuarioAtual() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ADMIN_EMAIL aceita mais de um e-mail separado por vírgula, para dar acesso
// a outra pessoa sem mexer no código.
export function ehAdmin(email: string | null | undefined) {
  if (!email) return false;
  const liberados = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return liberados.includes(email.trim().toLowerCase());
}
