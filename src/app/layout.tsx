import type { Metadata } from "next";
import localFont from "next/font/local";
import BarraDeCarregamento from "@/components/BarraDeCarregamento";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SoForaDoAdmin from "@/components/SoForaDoAdmin";
import "./globals.css";

// Fontes guardadas dentro do projeto: além de não depender da internet para
// compilar, o site carrega sem buscar nada em servidor externo.
// Fredoka nos títulos e DM Sans no texto corrido (identidade 3Sementes Store).
const fredoka = localFont({
  variable: "--font-fredoka",
  display: "swap",
  src: [{ path: "../fonts/Fredoka.woff2", weight: "300 700", style: "normal" }],
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  display: "swap",
  src: [{ path: "../fonts/DMSans.woff2", weight: "100 1000", style: "normal" }],
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
      className={`${fredoka.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <BarraDeCarregamento />
        <SoForaDoAdmin>
          <Header />
        </SoForaDoAdmin>
        <main className="flex-1">{children}</main>
        <SoForaDoAdmin>
          <Footer />
        </SoForaDoAdmin>
      </body>
    </html>
  );
}
