import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center sm:pt-20">
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
        <Link
          href="#categorias"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
        >
          Ver categorias
        </Link>
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
              <Link
                key={category.slug}
                href={`/categorias/${category.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background px-4 py-6 text-center transition-colors hover:border-accent/40"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm text-foreground">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
