// Nome e cor de cada situação de pedido no painel. Como tudo na loja é feito
// sob encomenda, "pago" aparece como "Em produção": é o que acontece em
// seguida. Cores suaves, uma por situação, para a lista ser lida de relance.
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
