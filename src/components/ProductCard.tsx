import Image from "next/image";
import Link from "next/link";
import { formatPriceCents } from "@/lib/format";
import { hexDaCor, opcaoEhCor } from "@/components/coresDosProdutos";

// "2 cores" para cor; "3 opções" quando a lista é de outra coisa (ex: Tema).
// Com uma opção só ou nenhuma, não há o que avisar.
function textoDasOpcoes(opcoes: string[], rotulo?: string | null) {
  if (opcoes.length < 2) return null;
  return `${opcoes.length} ${opcaoEhCor(rotulo) ? "cores" : "opções"}`;
}

// Até três bolinhas com as cores do produto (só para cores que a loja sabe
// desenhar; opção que não é cor, como "Tema", não ganha bolinha).
function bolinhas(opcoes: string[], rotulo?: string | null) {
  if (!opcaoEhCor(rotulo)) return [];
  const vistas = new Set<string>();
  for (const nome of opcoes) {
    const hex = hexDaCor(nome);
    if (hex) vistas.add(hex);
    if (vistas.size === 3) break;
  }
  return [...vistas];
}

// Card da vitrine: foto em cima, nome e preço embaixo em alto contraste (sem
// texto por cima da foto), e a etiqueta de cores no canto da imagem. Quem usa
// pode pôr um botão embaixo (`acao`), fora do link do card.
export default function ProductCard({
  slug,
  name,
  priceCents,
  image,
  colors = [],
  optionLabel,
  acao,
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
  acao?: React.ReactNode;
  sizes?: string;
}) {
  const opcoes = textoDasOpcoes(colors, optionLabel);
  const pontos = bolinhas(colors, optionLabel);

  return (
    <div className="product-card overflow-hidden rounded-2xl border border-border bg-surface">
      <Link href={`/produtos/${slug}`} className="block">
        <span className="relative block aspect-square bg-muted-bg">
          {opcoes && (
            <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-bold leading-none text-foreground">
              {opcoes}
              {pontos.length > 0 && (
                <span aria-hidden className="flex items-center">
                  {pontos.map((hex) => (
                    <span
                      key={hex}
                      style={{ backgroundColor: hex }}
                      className="-ml-0.5 h-3 w-3 rounded-full border border-foreground/20 first:ml-0"
                    />
                  ))}
                </span>
              )}
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

        <span className="block px-3.5 pb-3 pt-3">
          <span className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-foreground">
            {name}
          </span>
          <span className="mt-1 block text-[15px] font-bold text-primary">
            {formatPriceCents(priceCents)}
          </span>
        </span>
      </Link>

      {acao && <div className="px-3.5 pb-3.5">{acao}</div>}
    </div>
  );
}
