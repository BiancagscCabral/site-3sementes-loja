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

// Buquê da 3SFlores.
export function IconeBuque({ className }: Props) {
  return <IconeDeArte arquivo="3sflores.png" className={className} />;
}

export function IconeColar({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M4.5 3.5c0 9 3 14 7.5 14s7.5-5 7.5-14" />
      <circle cx="12" cy="20" r="2.2" />
      <path d="M12 17.5v.3" />
    </Base>
  );
}

export function IconeGuia({ className }: Props) {
  const contas = [
    [6.2, 7.5],
    [7.6, 12],
    [10, 15.4],
    [14, 15.4],
    [16.4, 12],
    [17.8, 7.5],
  ];
  return (
    <Base className={className}>
      <path d="M5.6 3c-.5 6 1 10.5 4 13.2M18.4 3c.5 6-1 10.5-4 13.2" />
      {contas.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" />
      ))}
      <path d="M12 17.5v1.7M10.4 19.2h3.2l-1.6 3z" />
    </Base>
  );
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
