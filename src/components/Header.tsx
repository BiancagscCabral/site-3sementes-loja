import Link from "next/link";

const NAV_LINKS = [
  { href: "#lojas", label: "Nossas Redes" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export default function Header() {
  return (
    <div className="sticky top-0 z-10">
      <div className="bg-primary-dark px-6 py-2 text-center text-xs tracking-wide text-primary-foreground">
        Peças artesanais feitas à mão &middot; Envio para todo o Brasil
      </div>
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-xl font-medium tracking-tight text-foreground"
          >
            3sementes
          </Link>
          <nav className="hidden gap-8 text-sm text-muted sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </div>
  );
}
