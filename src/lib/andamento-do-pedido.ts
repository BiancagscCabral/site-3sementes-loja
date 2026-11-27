import type { OrderStatus } from "@/generated/prisma/enums";
import { primeiraVezEm, type EventoDoPedido } from "@/lib/eventos-do-pedido";

// As etapas que a cliente vê na página do pedido.
//
// Cada etapa é ligada a uma situação do pedido, então a trilha anda sozinha
// conforme a loja muda a situação no painel: não há nada a manter em dois
// lugares. A data de cada etapa vem do histórico de eventos.

export type Etapa = {
  nome: string;
  // O que dizer quando o pedido está parado nesta etapa.
  agora: string;
  estado: "feita" | "atual" | "futura";
  em: Date | null;
};

type PedidoParaAndamento = {
  status: string;
  paymentStatus: string;
  createdAt: Date;
};

type Modelo = {
  nome: string;
  agora: string;
  // Situação que marca esta etapa como alcançada.
  situacao: OrderStatus | null; // null = a criação do pedido
};

// Caminho de quem pagou pelo site.
const PAGAMENTO_ONLINE: Modelo[] = [
  {
    nome: "Pedido recebido",
    agora: "Seu pedido está registrado e esperando o pagamento.",
    situacao: null,
  },
  {
    nome: "Pagamento confirmado",
    agora: "Recebemos seu pagamento. Logo começamos a preparar sua peça.",
    situacao: "PAID",
  },
  {
    nome: "Em produção",
    agora:
      "Sua peça está sendo feita. Como tudo aqui é à mão, cada uma leva o tempo que precisa.",
    situacao: "IN_PRODUCTION",
  },
  {
    nome: "Postado",
    agora: "Sua encomenda saiu para entrega.",
    situacao: "SHIPPED",
  },
  {
    nome: "Entregue",
    agora: "Sua encomenda foi entregue. Esperamos que você goste.",
    situacao: "DELIVERED",
  },
];

// Caminho de quem fechou pela conversa: não há pagamento online para esperar.
const PELO_WHATSAPP: Modelo[] = [
  {
    nome: "Pedido recebido",
    agora: "Recebemos seu pedido e vamos combinar os detalhes por mensagem.",
    situacao: null,
  },
  {
    nome: "Em produção",
    agora:
      "Sua peça está sendo feita. Como tudo aqui é à mão, cada uma leva o tempo que precisa.",
    situacao: "IN_PRODUCTION",
  },
  {
    nome: "Postado",
    agora: "Sua encomenda saiu para entrega.",
    situacao: "SHIPPED",
  },
  {
    nome: "Entregue",
    agora: "Sua encomenda foi entregue. Esperamos que você goste.",
    situacao: "DELIVERED",
  },
];

// Qual dos dois caminhos este pedido seguiu.
//
// O banco não guarda a origem do pedido, então isto é dedução. Nasce como
// "aguardando contato" quem veio pelo WhatsApp, mas essa marca se perde no
// momento em que o pedido é avançado: aí só o que sobra é que ele nunca teve
// pagamento online confirmado.
//
// A segunda condição precisa excluir "aguardando pagamento", senão um pedido
// do site esperando o Pix seria lido como conversa e perderia a etapa de
// pagamento justo quando ela importa.
//
// O certo seria uma coluna de origem no banco. Enquanto não há, isto acerta
// em todos os caminhos que o painel permite.
function fechadoNaConversa(pedido: PedidoParaAndamento) {
  if (pedido.status === "AWAITING_CONTACT") return true;
  return (
    pedido.paymentStatus !== "PAID" && pedido.status !== "AWAITING_PAYMENT"
  );
}

// Quanto o pedido já andou, em número de etapas alcançadas.
function etapaAtual(pedido: PedidoParaAndamento, modelo: Modelo[]) {
  // Pagamento que entrou a menos: o dinheiro chegou, mas o pedido fica retido
  // para conferência. Para a cliente ainda é a primeira etapa, porque dizer
  // "confirmado" prometeria um preparo que não começou.
  if (pedido.paymentStatus === "PAID" && pedido.status === "AWAITING_PAYMENT") {
    return 0;
  }

  const ordem: OrderStatus[] = [
    "PAID",
    "IN_PRODUCTION",
    "SHIPPED",
    "DELIVERED",
  ];
  const alcancadas = ordem.slice(
    0,
    ordem.indexOf(pedido.status as OrderStatus) + 1,
  );

  // A última etapa do modelo que o pedido já alcançou.
  let atual = 0;
  modelo.forEach((etapa, indice) => {
    if (etapa.situacao && alcancadas.includes(etapa.situacao)) atual = indice;
  });
  return atual;
}

export function andamentoDoPedido(
  pedido: PedidoParaAndamento,
  eventos: EventoDoPedido[] = [],
): { etapas: Etapa[] } | null {
  // Pedido cancelado não tem andamento a mostrar: a página diz isso com todas
  // as letras, em vez de desenhar uma trilha que parou no meio.
  if (pedido.status === "CANCELLED") return null;

  const modelo = fechadoNaConversa(pedido) ? PELO_WHATSAPP : PAGAMENTO_ONLINE;
  const atual = etapaAtual(pedido, modelo);
  const quando = primeiraVezEm(eventos);

  const etapas = modelo.map((etapa, indice) => ({
    nome: etapa.nome,
    agora: etapa.agora,
    estado:
      indice < atual
        ? ("feita" as const)
        : indice === atual
          ? ("atual" as const)
          : ("futura" as const),
    // A primeira etapa é a criação do pedido, que não tem evento próprio.
    em:
      indice > atual
        ? null
        : etapa.situacao === null
          ? pedido.createdAt
          : (quando.get(etapa.situacao) ?? null),
  }));

  return { etapas };
}
