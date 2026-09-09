import { STORES } from "@/lib/catalog";

const CATEGORIES = STORES.flatMap((store) =>
  store.categories.map((category) => ({
    name: category,
    icon: store.icon,
    accent: store.accent,
    href: store.href,
  })),
);

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-8 text-center sm:pt-20">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-xs uppercase tracking-wide text-muted">
          Feito à mão, com carinho
        </span>
        <h1 className="font-display mx-auto mt-6 max-w-2xl text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          Peças artesanais que viram presente
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted">
          Joias e flores eternas feitas à mão em Igarassu e Recife, uma peça
          de cada vez.
        </p>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {STORES.map((store) => (
            <a
              key={store.slug}
              href={store.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                store.accent === "gold"
                  ? "group flex flex-col justify-between rounded-3xl bg-gold/10 p-10 transition-colors hover:bg-gold/15"
                  : "group flex flex-col justify-between rounded-3xl bg-bloom/10 p-10 transition-colors hover:bg-bloom/15"
              }
            >
              <div>
                <span className="text-4xl">{store.icon}</span>
                <h2 className="font-display mt-4 text-2xl text-foreground">
                  {store.name}
                </h2>
                <p
                  className={
                    store.accent === "gold"
                      ? "mt-1 text-sm font-medium text-gold"
                      : "mt-1 text-sm font-medium text-bloom"
                  }
                >
                  {store.tagline}
                </p>
                <p className="mt-3 text-sm text-muted">{store.description}</p>
              </div>
              <span className="mt-6 inline-block text-sm text-foreground underline-offset-4 group-hover:underline">
                Ver no Instagram &rarr;
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        id="categorias"
        className="scroll-mt-28 border-t border-border bg-surface px-6 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Categorias
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {CATEGORIES.map((category) => (
              <a
                key={category.name}
                href={category.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background px-4 py-6 text-center transition-colors hover:border-foreground/20"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm text-foreground">
                  {category.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="scroll-mt-28 px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Sobre a 3sementes &amp; 3sflores
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted">
            Desde 2019, criamos joias artesanais e flores eternas em Igarassu
            e Recife (PE). Cada peça é feita à mão, do início ao fim, com fio
            dourado, miçangas e chenille — para durar e contar uma história.
          </p>
        </div>
      </section>
    </div>
  );
}
