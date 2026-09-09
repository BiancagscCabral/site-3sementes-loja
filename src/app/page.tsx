const STORES = [
  {
    name: "3sementes",
    tagline: "Braceletes, colares, anéis e guias",
    description:
      "Joias artesanais em fio dourado e miçangas coloridas, incluindo guias e artigos religiosos.",
    icon: "📿",
    accent: "gold" as const,
    href: "https://www.instagram.com/3sementes_store/",
  },
  {
    name: "3sflores",
    tagline: "Flores eternas de chenille",
    description:
      "O primeiro ateliê de flores eternas de Recife: buquês coloridos que nunca murcham.",
    icon: "🌸",
    accent: "bloom" as const,
    href: "https://www.instagram.com/3sflores/",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-xs uppercase tracking-wide text-muted">
          Feito à mão, com carinho
        </span>
        <h1 className="font-display max-w-xl text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          Sementes e flores que viram peças para você usar e presentear
        </h1>
        <p className="max-w-md text-base leading-7 text-muted">
          Joias artesanais e flores eternas feitas à mão em Igarassu e Recife,
          uma peça de cada vez.
        </p>
        <a
          href="#lojas"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Ver nossas lojas
        </a>
      </section>

      <section
        id="lojas"
        className="border-t border-border bg-surface px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Nossas lojas
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {STORES.map((store) => (
              <a
                key={store.name}
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-background p-8 transition-colors hover:border-foreground/20"
              >
                <span className="text-3xl">{store.icon}</span>
                <h3 className="mt-4 font-display text-xl text-foreground">
                  {store.name}
                </h3>
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
                <span className="mt-4 inline-block text-sm text-foreground underline-offset-4 group-hover:underline">
                  Ver no Instagram &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Sobre a 3sementes &amp; 3sflores
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted">
            Desde 2019, criamos joias artesanais e flores eternas em Igarassu
            e Recife (PE). Cada peça é feita à mão, do início ao fim, com
            fio dourado, miçangas e chenille — para durar e contar uma
            história.
          </p>
        </div>
      </section>
    </div>
  );
}
