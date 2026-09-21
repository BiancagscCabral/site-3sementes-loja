import Image from "next/image";

// Mostra a foto do produto quando existe; senão, a logo da marca como marca d'água.
export default function ProductThumb({
  image,
  logo,
  markClass,
  markSize = 52,
  sizes = "(max-width: 640px) 50vw, 240px",
  className = "",
}: {
  image?: { url: string; altText: string | null } | null;
  logo: string;
  markClass: string;
  markSize?: number;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-background ${className}`}
    >
      {image ? (
        <Image
          src={image.url}
          alt={image.altText ?? ""}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <Image
          src={logo}
          alt=""
          width={markSize}
          height={markSize}
          className={markClass}
        />
      )}
    </div>
  );
}
