import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão a cada navegação, para o login não cair sozinho.
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGravar) {
          for (const { name, value } of cookiesParaGravar) {
            request.cookies.set(name, value);
          }
          resposta = NextResponse.next({ request });
          for (const { name, value, options } of cookiesParaGravar) {
            resposta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return resposta;
}

export const config = {
  // Só nas telas que dependem de login; o resto do site não precisa.
  matcher: ["/admin/:path*", "/minha-conta/:path*"],
};
