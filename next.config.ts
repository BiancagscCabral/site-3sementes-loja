import type { NextConfig } from "next";

// As fotos dos produtos vêm do Supabase Storage. O next/image recusa endereço
// de fora que não esteja declarado aqui, de propósito: senão qualquer site
// poderia usar o otimizador de imagem da loja como hospedagem de graça.
// Lemos o endereço da variável de ambiente em vez de escrever na mão, para não
// ficar errado se o projeto do Supabase mudar.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabase
      ? [new URL(`${supabase.replace(/\/$/, "")}/storage/v1/object/public/**`)]
      : [],
  },

  // Permite compilar em outra pasta (NEXT_DIST_DIR=.next-teste) sem derrubar o
  // `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",

  // A home lê a pasta das fotos do topo em tempo de execução. Na Vercel, cada
  // página vira uma função isolada e só recebe os arquivos que forem
  // declarados aqui — sem isto o carrossel ficaria vazio no site publicado.
  outputFileTracingIncludes: {
    "/": ["./public/img/hero/**"],
  },
};

export default nextConfig;
