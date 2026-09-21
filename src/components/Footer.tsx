import { CATEGORIES, INSTAGRAM_LINKS, WHATSAPP_URL } from "@/lib/catalog";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path
        d="M4 20l1.3-3.9A8 8 0 1 1 8.9 19L4 20Z"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9.3c.2 2.5 2.7 5 5.2 5.2.9.1 1.3-.7 1-1.3l-.6-1.2-1.6.4c-.8-.5-1.5-1.2-2-2l.4-1.6-1.2-.6c-.6-.3-1.3.1-1.2 1.1Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-xl text-foreground">
              Sobre a 3sementes
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Desde 2019, criamos joias artesanais e flores eternas (3sflores)
              em Igarassu e Recife (PE). Cada peça é feita à mão, do início ao
              fim, com fio dourado, miçangas e chenille — para durar e contar
              uma história.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-background"
            >
              <WhatsAppIcon />
            </a>
            {INSTAGRAM_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-background"
              >
                <InstagramIcon />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-border pt-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-medium text-foreground">Categorias</h3>
            <ul className="mt-3 flex flex-col gap-2 text-muted">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <a
                    href={`/categorias/${category.slug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Atendimento</h3>
            <ul className="mt-3 flex flex-col gap-2 text-muted">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  WhatsApp: (81) 92005-1830
                </a>
              </li>
              {INSTAGRAM_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Institucional</h3>
            <ul className="mt-3 flex flex-col gap-2 text-muted">
              <li>
                <a
                  href="/trocas-e-devolucoes"
                  className="transition-colors hover:text-foreground"
                >
                  Entrega, trocas e devoluções
                </a>
              </li>
              <li>
                <a
                  href="/politica-de-privacidade"
                  className="transition-colors hover:text-foreground"
                >
                  Política de privacidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground">Onde estamos</h3>
            <p className="mt-3 text-muted">Igarassu &amp; Recife, PE</p>
            <p className="text-muted">Feito à mão desde 2019</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} 3sementes</p>
          <a
            href="#"
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 transition-colors hover:text-foreground"
          >
            <ArrowUpIcon />
            Voltar ao topo
          </a>
        </div>
      </div>
    </footer>
  );
}
