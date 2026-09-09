import Link from "next/link";
import { STORES } from "@/lib/catalog";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path
        d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4c2-.3 3.8.8 6.5 3.2C14.7 4.8 16.5 3.7 18.5 4 22 4.5 23.3 8 21.5 11.5 19 15.65 12 20 12 20Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path d="M6 8h12l1 13H5L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  return (
    <div className="sticky top-0 z-10">
      <div className="bg-primary-dark px-6 py-2 text-center text-xs tracking-wide text-primary-foreground">
        Peças artesanais feitas à mão &middot; Envio para todo o Brasil
      </div>

      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link
            href="/"
            className="font-display shrink-0 text-xl font-medium tracking-tight text-foreground"
          >
            3sementes 
          </Link>

          <div className="hidden flex-1 items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted sm:flex">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="ml-2 w-full bg-transparent outline-none placeholder:text-muted"
            />
          </div>

          <div className="ml-auto flex items-center gap-4 text-foreground sm:ml-0">
            <button type="button" aria-label="Minha conta">
              <UserIcon />
            </button>
            <button type="button" aria-label="Favoritos">
              <HeartIcon />
            </button>
            <button type="button" aria-label="Carrinho" className="relative">
              <BagIcon />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] text-primary-foreground">
                0
              </span>
            </button>
          </div>
        </div>

        <nav className="hidden justify-center gap-8 border-t border-border bg-surface px-6 py-2 text-sm text-muted sm:flex">
          {STORES.map((store) => (
            <div key={store.slug} className="group relative">
              <span className="cursor-default py-1 transition-colors group-hover:text-foreground">
                {store.name}
              </span>
              <div className="invisible absolute left-1/2 top-full z-20 min-w-48 -translate-x-1/2 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                {store.categories.map((category) => (
                  <a
                    key={category}
                    href={store.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block whitespace-nowrap rounded-lg px-3 py-2 text-left hover:bg-background hover:text-foreground"
                  >
                    {category}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <a href="#sobre" className="py-1 transition-colors hover:text-foreground">
            Sobre
          </a>
          <a
            href="#contato"
            className="py-1 transition-colors hover:text-foreground"
          >
            Contato
          </a>
        </nav>
      </header>
    </div>
  );
}
