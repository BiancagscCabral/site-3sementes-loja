import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, INSTAGRAM_LINKS, WHATSAPP_URL } from "@/lib/catalog";

const LINK =
  "text-foreground transition-colors hover:text-primary hover:underline underline-offset-4";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted-bg px-6 py-12 text-foreground">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        <div>
          <Image
            src="/img/logo-3sementes.png"
            alt="3Sementes Store"
            width={900}
            height={307}
            sizes="170px"
            className="h-14 w-auto"
          />
          <p className="mt-4 text-sm leading-7">
            Igarassu &amp; Recife, PE
            <br />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} underline`}
            >
              WhatsApp (81) 92005-1830
            </a>
          </p>
        </div>

        <nav aria-label="Categorias" className="flex flex-col gap-2.5 text-sm">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/categorias/${category.slug}`}
              className={LINK}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <nav aria-label="Institucional" className="flex flex-col gap-2.5 text-sm">
          <Link href="/prazo-entrega" className={LINK}>
            Prazo e entregas
          </Link>
          <Link href="/politica-de-privacidade" className={LINK}>
            Política de privacidade
          </Link>
          {INSTAGRAM_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              {link.label}
            </a>
          ))}
          <p className="mt-2 text-xs text-muted">
            Feito à mão desde 2019 &middot; &copy; 3sementes
          </p>
        </nav>
      </div>
    </footer>
  );
}
