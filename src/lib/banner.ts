import { WHATSAPP_URL } from "@/lib/catalog";

export type BannerSlide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  image?: string;
  tone: "olive" | "sage" | "orange";
};

// Para usar uma foto, salve em public/img/ e preencha `image` (ex: "/img/banner-flores.jpg").
export const BANNER_SLIDES: BannerSlide[] = [
  {
    eyebrow: "3sflores",
    title: "Flores eternas que nunca murcham",
    text: "Buquês de chenille feitos à mão no primeiro ateliê de flores eternas de Recife.",
    cta: { label: "Ver flores eternas", href: "/categorias/flores-eternas" },
    tone: "olive",
  },
  {
    eyebrow: "Joias artesanais",
    title: "Braceletes, colares, anéis e guias",
    text: "Fio dourado e miçangas montados peça por peça, desde 2019.",
    cta: { label: "Ver braceletes", href: "/categorias/braceletes" },
    tone: "sage",
  },
  {
    eyebrow: "Atendimento",
    title: "Enviamos para todo o Brasil",
    text: "Tire dúvidas, encomende e combine o frete direto com a gente pelo WhatsApp.",
    cta: { label: "Falar no WhatsApp", href: WHATSAPP_URL },
    tone: "orange",
  },
];
