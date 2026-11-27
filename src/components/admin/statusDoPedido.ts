// Nome e cor de cada situação de pedido no painel.
//
// "Pago" e "Em produção" são situações diferentes de propósito: o dinheiro
// entrar e a peça começar a ser feita são momentos distintos, e a cliente vê
// os dois na trilha do pedido. Cores suaves, uma por situação, para a lista
// ser lida de relance.
export const SITUACOES = [
  {
    valor: "AWAITING_CONTACT",
    nome: "Aguardando contato",
    chip: "bg-sun/45 text-foreground",
  },
  {
    valor: "AWAITING_PAYMENT",
    nome: "Aguardando pagamento",
    chip: "bg-rose/45 text-primary-dark",
  },
  {
    valor: "PAID",
    nome: "Pago",
    chip: "bg-[#cfe6c9] text-[#2f5a2a]",
  },
  {
    valor: "IN_PRODUCTION",
    nome: "Em produção",
    chip: "bg-sun/70 text-foreground",
  },
  {
    valor: "SHIPPED",
    nome: "Enviado",
    chip: "bg-[#cfe6c9] text-[#2f5a2a]",
  },
  {
    valor: "DELIVERED",
    nome: "Concluído",
    chip: "bg-[#ddd1f0] text-[#4f3a80]",
  },
  {
    valor: "CANCELLED",
    nome: "Cancelado",
    chip: "bg-muted-bg text-muted",
  },
] as const;

export function situacao(valor: string) {
  return (
    SITUACOES.find((item) => item.valor === valor) ?? {
      valor,
      nome: valor,
      chip: "bg-muted-bg text-muted",
    }
  );
}
