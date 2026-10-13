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

// Medidas de cada tamanho de bracelete (circunferência do braço)
export const SIZE_GUIDE: Record<string, string> = {
  P: "20 a 25 cm",
  M: "25 a 30 cm",
  G: "30 a 35 cm",
  GG: "35 a 40 cm",
};

// Tamanhos maiores levam mais material, por isso custam mais
export const SIZE_SURCHARGE_CENTS: Record<string, number> = {
  G: 500,
  GG: 500,
};

export function priceForSize(priceCents: number, size: string | null) {
  return priceCents + (size ? (SIZE_SURCHARGE_CENTS[size] ?? 0) : 0);
}

// "Enrolados (Rapunzel)" -> "enrolados-rapunzel". Usado para ligar o nome do
// arquivo da foto à opção correspondente do produto.
export function slugifyOption(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
