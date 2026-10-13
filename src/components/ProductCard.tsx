import Image from "next/image";
import Link from "next/link";
import { formatPriceCents } from "@/lib/format";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      className="h-[18px] w-[18px]"
    >
      <path d="M5 12h13M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Card da vitrine: a foto ocupa o card inteiro e o nome e o preço ficam por
// cima dela, sobre um degradê que garante a leitura em qualquer foto.
export default function ProductCard({
  slug,
  name,
  priceCents,
  image,
  logo,
  markClass,
  sizes = "(max-width: 640px) 50vw, 260px",
}: {
  slug: string;
  name: string;
  priceCents: number;
  image?: { url: string; altText: string | null } | null;
  logo: string;
  markClass: string;
  sizes?: string;
}) {
  return (
    <Link
      href={`/produtos/${slug}`}
      className="product-card relative block aspect-[3/4] overflow-hidden rounded-2xl bg-muted-bg"
    >
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
          <Image src={logo} alt="" width={56} height={56} className={markClass} />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-foreground/90 via-foreground/55 to-transparent p-4 pt-12">
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[15px] font-bold leading-snug text-background">
            {name}
          </span>
          <span className="mt-0.5 block text-sm font-medium text-background/85">
            {formatPriceCents(priceCents)}
          </span>
        </span>
        <span
          aria-hidden
          className="card-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
