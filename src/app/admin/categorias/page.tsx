import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import CabecalhoDoPainel from "@/components/admin/CabecalhoDoPainel";
import EmBreve from "@/components/admin/EmBreve";
import { IconeMais, IconeSeta } from "@/components/Icones";

export const dynamic = "force-dynamic";

export default async function CategoriasDoAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) redirect("/admin");

  const categorias = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      _count: { select: { products: true } },
      products: {
        where: { active: true, images: { some: {} } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          name: true,
          images: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true, altText: true },
          },
        },
      },
    },
  });

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10">
      <CabecalhoDoPainel
        titulo="Categorias"
        subtitulo="Veja como os produtos da loja estão organizados."
      >
        <span
          aria-disabled
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-full bg-primary/55 px-6 text-[15px] font-semibold text-primary-foreground"
        >
          <IconeMais className="h-[18px] w-[18px]" />
          Nova categoria
          <EmBreve />
        </span>
      </CabecalhoDoPainel>

      <ul className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categorias.map((categoria) => {
          const capa = categoria.products[0]?.images[0];
          return (
            <li key={categoria.slug}>
              <Link
                href={`/admin/produtos?categoria=${categoria.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-3.5 transition-shadow hover:shadow-[0_6px_20px_rgba(73,53,46,0.12)]"
              >
                <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-muted-bg">
                  {capa && (
                    <Image
                      src={capa.url}
                      alt={capa.altText ?? categoria.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[19px] font-semibold leading-tight text-primary">
                    {categoria.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted">
                    {categoria._count.products} produto
                    {categoria._count.products === 1 ? "" : "s"}
                  </span>
                </span>
                <IconeSeta className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
