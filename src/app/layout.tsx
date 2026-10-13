import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Fontes guardadas dentro do projeto: além de não depender da internet para
// compilar, o site carrega sem buscar nada em servidor externo.
const karla = localFont({
  variable: "--font-karla",
  display: "swap",
  src: [{ path: "../fonts/Karla.woff2", weight: "400 700", style: "normal" }],
});

const libreBaskerville = localFont({
  variable: "--font-libre",
  display: "swap",
  src: [
    { path: "../fonts/LibreBaskerville.woff2", weight: "400 700", style: "normal" },
  ],
});

const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "../fonts/CormorantGaramond.woff2", weight: "400 700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "3sementes",
  description:
    "Joias artesanais e flores eternas (3sflores) feitas à mão em Igarassu e Recife.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${karla.variable} ${libreBaskerville.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
