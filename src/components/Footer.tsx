const SOCIAL_LINKS = [
  {
    label: "@3sementes_store",
    href: "https://www.instagram.com/3sementes_store/",
  },
  { label: "@3sflores", href: "https://www.instagram.com/3sflores/" },
];

export default function Footer() {
  return (
    <footer id="contato" className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base text-foreground">
            3sementes &amp; 3sflores
          </p>
          <p className="mt-1">Igarassu &amp; Recife, PE &middot; desde 2019</p>
        </div>
        <div className="flex gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p>&copy; {new Date().getFullYear()} 3sementes &amp; 3sflores</p>
      </div>
    </footer>
  );
}
