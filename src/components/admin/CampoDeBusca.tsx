"use client";

import { IconeBusca } from "@/components/Icones";

// Campo de busca arredondado do painel. Quem usa guarda o texto.
export default function CampoDeBusca({
  valor,
  aoMudar,
  placeholder,
  rotulo,
  className = "sm:w-[340px]",
}: {
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder: string;
  rotulo: string;
  className?: string;
}) {
  return (
    <label
      className={`flex h-11 w-full items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-muted focus-within:border-primary ${className}`}
    >
      <IconeBusca className="h-[18px] w-[18px] shrink-0" />
      <input
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        aria-label={rotulo}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted"
      />
    </label>
  );
}
