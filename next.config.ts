import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite compilar em outra pasta (NEXT_DIST_DIR=.next-teste) sem derrubar o
  // `npm run dev` que estiver rodando.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
