// Selo para o que já tem lugar no painel mas ainda não funciona. O botão ou
// cartão que o leva fica visível e sem clique, em vez de sumir ou prometer
// algo que não acontece.
export default function EmBreve({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-full bg-sun/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground ${className}`}
    >
      em breve
    </span>
  );
}
