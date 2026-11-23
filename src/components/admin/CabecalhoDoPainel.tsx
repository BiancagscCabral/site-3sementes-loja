// Título e subtítulo no topo de cada tela do painel, com um espaço à direita
// para a busca ou o botão principal.
export default function CabecalhoDoPainel({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-display text-[34px] font-semibold leading-none text-primary sm:text-[40px]">
          {titulo}
        </h1>
        <p className="mt-2 text-[15px] text-foreground">{subtitulo}</p>
      </div>
      {children && <div className="w-full sm:w-auto">{children}</div>}
    </div>
  );
}
