// Arte do banner do topo: ondas rosa, amarela e terracota. O desenho cobre
// 830 x 460 e é esticado para a caixa em que for colocado.

const BASE_AMARELA = "M20 460C35 400 95 355 170 353C245 351 280 415 292 460Z";
const BASE_TERRACOTA = "M95 460C112 432 175 410 232 418C268 424 288 440 300 460Z";

export function ArteDoBanner({
  className,
  preserveAspectRatio = "none",
}: {
  className?: string;
  preserveAspectRatio?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 830 460"
      preserveAspectRatio={preserveAspectRatio}
      className={className}
    >
      <path
        className="fill-rose/60"
        d="M260 0C215 60 255 120 195 190C150 245 175 305 200 345C225 388 165 425 190 460H830V0Z"
      />
      <path
        className="fill-rose"
        d="M305 0C265 55 298 108 247 170C207 220 227 272 247 312C267 352 222 408 237 460H830V0Z"
      />
      <path
        className="fill-sun"
        d="M520 460C560 390 645 350 705 298C765 246 795 186 830 136V460Z"
      />
      <path
        className="fill-primary"
        d="M600 460C660 400 750 370 830 252V460Z"
      />
      <path className="fill-rose" d="M730 460C760 432 800 416 830 410V460Z" />
      <path className="fill-sun" d={BASE_AMARELA} />
      <path className="fill-primary" d={BASE_TERRACOTA} />
    </svg>
  );
}

// As duas ondas da base (amarela e terracota), para ficarem POR CIMA de uma
// foto comum e alinhadas com a arte que está atrás. No computador, a caixa da
// foto começa um pouco à direita do início da arte; por isso o recorte do
// desenho (viewBox "126 0 704 460") faz as ondas caírem no mesmo lugar.
export function OndasDaBase() {
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 830 460"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
      >
        <path className="fill-sun" d={BASE_AMARELA} />
        <path className="fill-primary" d={BASE_TERRACOTA} />
      </svg>
      <svg
        aria-hidden
        viewBox="126 0 704 460"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      >
        <path className="fill-sun" d={BASE_AMARELA} />
        <path className="fill-primary" d={BASE_TERRACOTA} />
      </svg>
    </>
  );
}
