import Link from "next/link";
import { CATEGORIES, INSTAGRAM_LINKS, WHATSAPP_URL } from "@/lib/catalog";

export default function Footer() {
  return (
    <footer className="bg-primary px-6 py-12 text-primary-foreground">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        <div>
          <span className="font-display text-2xl font-bold">3sementes</span>
          <p className="mt-2.5 text-sm leading-7 opacity-90">
            Igarassu &amp; Recife, PE
            <br />
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp (81) 92005-1830
            </a>
          </p>
        </div>

        <nav className="flex flex-col gap-2.5 text-sm">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/categorias/${category.slug}`}
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-2.5 text-sm">
          <Link
            href="/prazo-entrega"
            className="opacity-90 transition-opacity hover:opacity-100"
          >
            Prazo e entregas
          </Link>
          <Link
            href="/politica-de-privacidade"
            className="opacity-90 transition-opacity hover:opacity-100"
          >
            Política de privacidade
          </Link>
          {INSTAGRAM_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
          <p className="mt-2 text-xs opacity-75">
            Feito à mão desde 2019 &middot; &copy; 3sementes
          </p>
        </nav>
      </div>
    </footer>
  );
}
