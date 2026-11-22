import Image from "next/image";
import Link from "next/link";
import { formatPriceCents } from "@/lib/format";

// "2 cores" para cor; "3 opções" quando a lista é de outra coisa (ex: Tema).
// Com uma opção só ou nenhuma, não há o que avisar.
function textoDasOpcoes(opcoes: string[], rotulo?: string | null) {
  if (opcoes.length < 2) return null;
  const ehCor = !rotulo || rotulo.trim().toLowerCase() === "cor";
  return `${opcoes.length} ${ehCor ? "cores" : "opções"}`;
}

// Card da vitrine: foto em cima, nome e preço embaixo em alto contraste (sem
// texto por cima da foto), e a etiqueta de cores no canto da imagem.
export default function ProductCard({
  slug,
  name,
  priceCents,
  image,
  colors = [],
  optionLabel,
  sizes = "(max-width: 640px) 50vw, 260px",
}: {
  slug: string;
  name: string;
  priceCents: number;
  image?: { url: string; altText: string | null } | null;
  /** Mantidos por compatibilidade com quem chama; o card usa a flor da marca. */
  logo?: string;
  markClass?: string;
  colors?: string[];
  optionLabel?: string | null;
  sizes?: string;
}) {
  const opcoes = textoDasOpcoes(colors, optionLabel);

  return (
    <Link
      href={`/produtos/${slug}`}
      className="product-card block overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <span className="relative block aspect-[4/5] bg-muted-bg">
        {opcoes && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-bold leading-none text-foreground">
            {opcoes}
          </span>
        )}
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? name}
            fill
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/img/flor.png"
              alt=""
              width={64}
              height={64}
              className="opacity-40"
            />
          </span>
        )}
      </span>

      <span className="block px-3.5 pb-3.5 pt-3">
        <span className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-foreground">
          {name}
        </span>
        <span className="mt-1 block text-[15px] font-bold text-primary">
          {formatPriceCents(priceCents)}
        </span>
      </span>
    </Link>
  );
}
