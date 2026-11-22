// Arte do banner do topo: ondas rosa, amarela e terracota, desenhadas sobre as
// medidas da referência (1310 x 452). Os caminhos estão nessas coordenadas e
// cada SVG usa um viewBox que mostra só a parte que lhe cabe.

// Ondas: aparecem atrás de uma peça recortada e, por cima, de uma foto comum.
const AMARELA_DIREITA =
  "M1310 98L1296 108C1262 138 1230 178 1198 208C1166 238 1152 268 1122 294C1090 320 1052 332 1020 358C986 386 984 422 1004 452H1310Z";
const TERRACOTA_DIREITA =
  "M1310 208C1274 268 1218 298 1172 330C1124 364 1092 402 1086 452H1310Z";
const ROSA_CANTO = "M1310 372C1272 380 1236 410 1226 452H1310Z";
const AMARELA_BASE =
  "M500 452C505 400 560 345 640 332C720 320 766 386 786 452Z";
const TERRACOTA_BASE =
  "M585 452C600 420 650 396 715 396C770 396 806 425 820 452Z";

function Ondas() {
  return (
    <>
      <path className="fill-sun" d={AMARELA_DIREITA} />
      <path className="fill-primary" d={TERRACOTA_DIREITA} />
      <path className="fill-rose" d={ROSA_CANTO} />
      <path className="fill-sun" d={AMARELA_BASE} />
      <path className="fill-primary" d={TERRACOTA_BASE} />
    </>
  );
}

// Arte de trás (cobre da posição 480 até a borda direita da referência).
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
      viewBox="480 0 830 452"
      preserveAspectRatio={preserveAspectRatio}
      className={className}
    >
      {/* Rosa forte colado na borda do creme e rosa claro mais para dentro */}
      <path
        className="fill-rose"
        d="M720 0C705 45 690 72 668 110C645 150 618 175 622 215C626 255 655 270 668 300C680 330 640 350 640 380C640 410 600 430 590 452H1310V0Z"
      />
      <path
        className="fill-rose/55"
        d="M790 0C768 60 752 112 724 152C702 186 692 232 707 272C718 302 728 332 708 362C692 388 702 422 692 452H1310V0Z"
      />
      <Ondas />
    </svg>
  );
}

// As mesmas ondas, para ficarem POR CIMA de uma foto comum, alinhadas com a
// arte de trás. No computador, a caixa da foto começa na posição 576 da
// referência (44% da largura); no celular, a caixa usa o desenho inteiro.
export function OndasDaFrente() {
  return (
    <>
      <svg
        aria-hidden
        viewBox="480 0 830 452"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
      >
        <Ondas />
      </svg>
      <svg
        aria-hidden
        viewBox="576 0 734 452"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      >
        <Ondas />
      </svg>
    </>
  );
}
