import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
