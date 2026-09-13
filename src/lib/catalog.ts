export const STORE_NAME = "3sementes";

const WHATSAPP_NUMBER = "5581920051830";

export function getWhatsAppUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_URL = getWhatsAppUrl(
  "Olá! Vim pelo site e gostaria de saber mais.",
);

export const INSTAGRAM_LINKS = [
  {
    label: "@3sementes_store",
    href: "https://www.instagram.com/3sementes_store/",
  },
  { label: "@3sflores", href: "https://www.instagram.com/3sflores/" },
];

export const CATEGORIES = [
  { slug: "guias", name: "Guias e Brajás" },
  { slug: "braceletes", name: "Braceletes" },
  { slug: "colares", name: "Colares e Chokers" },
  { slug: "pulseiras", name: "Pulseiras" },
  { slug: "tornozeleiras", name: "Tornozeleiras" },
  { slug: "aneis", name: "Anéis" },
  { slug: "flores-eternas", name: "Flores Eternas" },
  { slug: "acessorios", name: "Acessórios" },
  { slug: "decoracao", name: "Decoração" },
];

const FLORES_CATEGORY_SLUG = "flores-eternas";

export function getCategoryBrand(categorySlug: string) {
  return categorySlug === FLORES_CATEGORY_SLUG
    ? {
        themeClass: "theme-flores",
        logo: "/img/logo-3sflores.png",
        markClass: "scale-150 opacity-45",
        isFlores: true,
      }
    : {
        themeClass: "",
        logo: "/img/logo.png",
        markClass: "opacity-20",
        isFlores: false,
      };
}
