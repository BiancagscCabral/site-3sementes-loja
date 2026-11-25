// As etapas que a cliente vê na página do pedido.
//
// Cuidado ao mexer: etapa que acende sempre junto com outra não informa nada,
// só ocupa espaço e dá impressão de progresso que não existe. Por isso aqui
// não há uma etapa "Em produção" separada de "Pagamento confirmado": no
// banco as duas são o mesmo estado (PAID), porque tudo é feito sob encomenda
// e o preparo começa quando o dinheiro entra. Virariam duas luzes acendendo
// no mesmo instante.
//
// Em vez disso, cada etapa tem um texto de "é aqui que estamos agora", e o de
// pagamento confirmado é justamente "estamos preparando sua peça".

export type Etapa = {
  nome: string;
  // O que dizer quando o pedido está parado nesta etapa.
  agora: string;
  estado: "feita" | "atual" | "futura";
};

type PedidoParaAndamento = {
  status: string;
  paymentStatus: string;
};

// Caminho de quem pagou pelo site.
const PAGAMENTO_ONLINE = [
  {
    nome: "Pedido recebido",
    agora: "Seu pedido está registrado e esperando o pagamento.",
  },
  {
    nome: "Pagamento confirmado",
    agora:
      "Recebemos seu pagamento e já estamos preparando sua peça. Como tudo aqui é feito à mão, cada uma leva o tempo que precisa.",
  },
  {
    nome: "Postado",
    agora: "Sua encomenda está a caminho.",
  },
  {
    nome: "Entregue",
    agora: "Sua encomenda foi entregue. Esperamos que você goste.",
  },
] as const;

// Caminho de quem fechou pela conversa: não há pagamento online para esperar.
const PELO_WHATSAPP = [
  {
    nome: "Pedido recebido",
    agora: "Recebemos seu pedido e vamos combinar os detalhes por mensagem.",
  },
  {
    nome: "Postado",
    agora: "Sua encomenda está a caminho.",
  },
  {
    nome: "Entregue",
    agora: "Sua encomenda foi entregue. Esperamos que você goste.",
  },
] as const;

// Qual dos dois caminhos este pedido seguiu.
//
// O banco não guarda a origem do pedido, então isto é dedução. Nasce como
// "aguardando contato" quem veio pelo WhatsApp, mas essa marca se perde no
// momento em que o pedido é avançado para postado: aí só o que sobra é que
// ele nunca teve pagamento online confirmado.
//
// As duas condições juntas cobrem os casos reais. A segunda precisa excluir
// "aguardando pagamento", senão um pedido do site esperando o Pix seria lido
// como conversa e perderia a etapa de pagamento justo quando ela importa.
//
// O certo mesmo seria uma coluna no banco dizendo a origem. Enquanto não há,
// isto acerta em todos os caminhos que o painel permite.
function fechadoNaConversa(pedido: PedidoParaAndamento) {
  if (pedido.status === "AWAITING_CONTACT") return true;
  return (
    pedido.paymentStatus !== "PAID" && pedido.status !== "AWAITING_PAYMENT"
  );
}

// Em qual etapa o pedido está, contando de zero.
function etapaAtual(pedido: PedidoParaAndamento, pelaConversa: boolean) {
  if (pedido.status === "DELIVERED") return pelaConversa ? 2 : 3;
  if (pedido.status === "SHIPPED") return pelaConversa ? 1 : 2;
  if (pelaConversa) return 0;

  // Pagamento que entrou a menos: o dinheiro chegou, mas o pedido fica retido
  // para conferência. Para a cliente, ainda é a primeira etapa — dizer
  // "confirmado" aqui prometeria um preparo que não começou.
  if (pedido.paymentStatus === "PAID" && pedido.status !== "AWAITING_PAYMENT") {
    return 1;
  }
  return 0;
}

export function andamentoDoPedido(
  pedido: PedidoParaAndamento,
): { etapas: Etapa[] } | null {
  // Pedido cancelado não tem andamento a mostrar: a página diz isso com
  // todas as letras, em vez de desenhar uma trilha que parou no meio.
  if (pedido.status === "CANCELLED") return null;

  const pelaConversa = fechadoNaConversa(pedido);
  const modelo = pelaConversa ? PELO_WHATSAPP : PAGAMENTO_ONLINE;
  const atual = etapaAtual(pedido, pelaConversa);

  const etapas = modelo.map((etapa, indice) => ({
    nome: etapa.nome,
    agora: etapa.agora,
    estado:
      indice < atual
        ? ("feita" as const)
        : indice === atual
          ? ("atual" as const)
          : ("futura" as const),
  }));

  return { etapas };
}
