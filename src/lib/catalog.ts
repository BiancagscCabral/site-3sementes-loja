export type Accent = "gold" | "bloom";

export const STORES = [
  {
    slug: "3sementes",
    name: "3sementes",
    tagline: "Braceletes, colares, anéis e guias",
    description:
      "Joias artesanais em fio dourado e miçangas coloridas, incluindo guias e artigos religiosos.",
    icon: "📿",
    accent: "gold" as Accent,
    href: "https://www.instagram.com/3sementes_store/",
    categories: ["Braceletes", "Colares", "Anéis", "Guias"],
  },
  {
    slug: "3sflores",
    name: "3sflores",
    tagline: "Flores eternas de chenille",
    description:
      "O primeiro ateliê de flores eternas de Recife: buquês coloridos que nunca murcham.",
    icon: "🌸",
    accent: "bloom" as Accent,
    href: "https://www.instagram.com/3sflores/",
    categories: ["Flores Eternas"],
  },
];
