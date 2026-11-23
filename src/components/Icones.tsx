// Ícones de linha da loja, todos no mesmo estilo (traço arredondado, 1.7).
// Os de categoria desenham a peça; os de benefício explicam o que a loja oferece.

type Props = { className?: string };

function Base({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

// Categorias

// Ícones em arte (Braceletes e 3SFlores): desenhos guardados como imagem só com
// o traço. Usados como máscara, eles assumem a cor do texto (text-primary etc.),
// como os ícones de linha.
//
// `ajusteX` corrige o peso visual do desenho: é quanto (em % da largura) o
// centro de massa do traço fica à direita do meio da imagem. O ícone é
// deslocado para a esquerda nessa medida, para parecer centralizado na flor.
function IconeDeArte({
  arquivo,
  className,
  ajusteX = 0,
}: Props & { arquivo: string; ajusteX?: number }) {
  const imagem = `url(/img/icones/${arquivo})`;
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className ?? ""}`}
      style={{
        WebkitMaskImage: imagem,
        maskImage: imagem,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        transform: ajusteX ? `translateX(${-ajusteX}%)` : undefined,
      }}
    />
  );
}

export function IconeBraceletes({ className }: Props) {
  return (
    <IconeDeArte arquivo="braceletes.png" ajusteX={2.5} className={className} />
  );
}

// Arames com contas, para "Mais acessórios".
export function IconeAcessorios({ className }: Props) {
  return (
    <IconeDeArte arquivo="acessorios.png" ajusteX={4.6} className={className} />
  );
}

// Choker de arame com flor e espirais, para Colares e Chokers.
export function IconeColares({ className }: Props) {
  return (
    <IconeDeArte arquivo="colares.png" ajusteX={7.2} className={className} />
  );
}

// Colar de contas com pingente de touro, para Guias e Brajás.
export function IconeGuias({ className }: Props) {
  return <IconeDeArte arquivo="guias.png" className={className} />;
}

// Buquê da 3SFlores.
export function IconeBuque({ className }: Props) {
  return <IconeDeArte arquivo="3sflores.png" className={className} />;
}

// Benefícios e interface

export function IconeFolha({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M20 4c-9 0-15 4-15 11 0 2 .6 3.6 1.6 4.8C8 20.4 9.4 21 11 21c7 0 9-8 9-17Z" />
      <path d="M5 21c2-5 5-8.5 9-11" />
    </Base>
  );
}

export function IconeCoracao({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M12 20.5C6 16 3 12.6 3 9a4.6 4.6 0 0 1 9-1.4A4.6 4.6 0 0 1 21 9c0 3.600-3 7-9 11.500Z" />
    </Base>
  );
}

// Dois controles deslizantes: personalizar do seu jeito.
export function IconeAjustes({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2.4" fill="var(--background)" />
      <circle cx="15" cy="17" r="2.4" fill="var(--background)" />
    </Base>
  );
}

export function IconeCartao({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 10h19M6.5 15h4" />
    </Base>
  );
}

export function IconeCaminhao({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.500h-7" />
      <circle cx="7" cy="17.500" r="2" />
      <circle cx="17" cy="17.500" r="2" />
    </Base>
  );
}

export function IconeBusca({ className }: Props) {
  return (
    <Base className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  );
}

export function IconeConta({ className }: Props) {
  return (
    <Base className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.500 20.500c.8-4 4-6 7.500-6s6.700 2 7.500 6" />
    </Base>
  );
}

export function IconeSacola({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M5.400 8h13.200l1 12.200a1 1 0 0 1-1 1.080H5.400a1 1 0 0 1-1-1.080L5.400 8Z" />
      <path d="M8.800 10.400V6.600a3.200 3.200 0 0 1 6.400 0v3.800" />
    </Base>
  );
}

export function IconeMenu({ aberto, className }: Props & { aberto: boolean }) {
  return (
    <Base className={className}>
      {aberto ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </Base>
  );
}

export function IconeSeta({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  );
}

export function IconeSetaBaixo({ className }: Props) {
  return (
    <Base className={className}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function IconeWhatsApp({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M3.500 20.500l1.200-4.200A8.500 8.500 0 1 1 8 19.400z" />
      <path d="M9 9.500c.4 2.500 2.500 4.600 5.200 5.300l1.200-1.300-2-1-.9.800c-1-.4-1.900-1.300-2.300-2.200l.8-.9-1-2z" />
    </Base>
  );
}

// Painel da loja

export function IconeCaixa({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M12 3 3.5 7.5v9L12 21l8.5-4.500v-9L12 3Z" />
      <path d="M3.500 7.500 12 12l8.500-4.500M12 12v9" />
    </Base>
  );
}

export function IconeCamadas({ className }: Props) {
  return (
    <Base className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12.500 9 5 9-5M3 16.500l9 5 9-5" />
    </Base>
  );
}

export function IconeClientes({ className }: Props) {
  return (
    <Base className={className}>
      <circle cx="9" cy="8" r="3.500" />
      <path d="M2.500 20c.6-3.500 3.200-5.500 6.500-5.500s5.900 2 6.500 5.500" />
      <path d="M16 4.700a3.500 3.500 0 0 1 0 6.600M18 14.800c1.800.7 3 2.400 3.400 5.200" />
    </Base>
  );
}

export function IconeEngrenagem({ className }: Props) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.500v2.600M12 18.900v2.600M4.200 7.200l2.200 1.300M17.600 15.500l2.200 1.300M4.200 16.800l2.200-1.300M17.600 8.500l2.200-1.300" />
      <circle cx="12" cy="12" r="7.200" />
    </Base>
  );
}

export function IconeSair({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M10 4H5.500A1.500 1.500 0 0 0 4 5.500v13A1.500 1.500 0 0 0 5.500 20H10" />
      <path d="M15 8l4 4-4 4M19 12H9" />
    </Base>
  );
}

export function IconeBarras({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="3.500" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="16.500" y="3.500" width="4" height="16.500" rx="1" />
    </Base>
  );
}

export function IconeNuvem({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M7 18a4.500 4.500 0 0 1-.6-8.960A6 6 0 0 1 18 9.500a4 4 0 0 1-.5 8" />
      <path d="M12 21v-8M9 15.500l3-3 3 3" />
    </Base>
  );
}

export function IconeMais({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function IconeOlho({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M2 12s3.600-6.500 10-6.500S22 12 22 12s-3.600 6.500-10 6.500S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.800" />
    </Base>
  );
}

export function IconeEmail({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.500" />
      <path d="m4 7.500 8 6 8-6" />
    </Base>
  );
}

export function IconeCadeado({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="4.500" y="10.500" width="15" height="10" rx="2.500" />
      <path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" />
    </Base>
  );
}

export function IconePontos({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="5.500" r="1.700" />
      <circle cx="12" cy="12" r="1.700" />
      <circle cx="12" cy="18.500" r="1.700" />
    </svg>
  );
}
