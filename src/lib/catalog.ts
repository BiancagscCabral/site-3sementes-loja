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
  { slug: "braceletes", name: "Braceletes", icon: "📿" },
  { slug: "colares", name: "Colares", icon: "📿" },
  { slug: "aneis", name: "Anéis", icon: "💍" },
  { slug: "guias", name: "Guias", icon: "🙏" },
  { slug: "flores-eternas", name: "Flores Eternas", icon: "🌸" },
];
