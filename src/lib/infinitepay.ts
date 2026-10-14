// Checkout da InfinitePay.
// Documentação: https://www.infinitepay.io/checkout-documentacao
//
// Só é chamado do servidor. Nada aqui vai para o navegador.

const BASE = "https://api.checkout.infinitepay.io";

export type ItemDoLink = {
  description: string;
  quantity: number;
  price: number; // em centavos
};

export type DadosDoLink = {
  orderNsu: string; // nosso código do pedido
  itens: ItemDoLink[];
  cliente?: { nome?: string; email?: string | null; telefone?: string };
  endereco?: {
    cep?: string;
    rua?: string;
    bairro?: string;
    numero?: string;
    complemento?: string;
  };
};

export class ErroDePagamento extends Error {}

export function pagamentoConfigurado() {
  const handle = (process.env.INFINITEPAY_HANDLE ?? "").trim();
  return handle.length > 2 && !/^(sua|seu|cole|troque)/i.test(handle);
}

function enderecoDoSite() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return url.replace(/\/$/, "");
}

// Só dígitos, no formato que a InfinitePay espera: +5581999999999
function telefoneInternacional(telefone?: string) {
  if (!telefone) return undefined;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return undefined;
  return `+55${digitos.slice(-11)}`;
}

export async function criarLinkDePagamento(dados: DadosDoLink) {
  if (!pagamentoConfigurado()) {
    throw new ErroDePagamento("Pagamento online ainda não configurado.");
  }
  const site = enderecoDoSite();
  if (!site.startsWith("https://")) {
    throw new ErroDePagamento(
      "NEXT_PUBLIC_SITE_URL precisa ser o endereço público https do site.",
    );
  }

  const resposta = await fetch(`${BASE}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      handle: process.env.INFINITEPAY_HANDLE,
      order_nsu: dados.orderNsu,
      items: dados.itens,
      redirect_url: `${site}/pedido/${dados.orderNsu}`,
      webhook_url: `${site}/api/webhooks/infinitepay`,
      customer: dados.cliente
        ? {
            name: dados.cliente.nome,
            email: dados.cliente.email ?? undefined,
            phone_number: telefoneInternacional(dados.cliente.telefone),
          }
        : undefined,
      address: dados.endereco
        ? {
            cep: dados.endereco.cep?.replace(/\D/g, ""),
            street: dados.endereco.rua,
            neighborhood: dados.endereco.bairro,
            number: dados.endereco.numero,
            complement: dados.endereco.complemento || undefined,
          }
        : undefined,
    }),
    cache: "no-store",
  });

  const texto = await resposta.text();
  if (!resposta.ok) {
    throw new ErroDePagamento(
      `InfinitePay respondeu ${resposta.status} ao criar o link: ${texto.slice(0, 200)}`,
    );
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = JSON.parse(texto);
  } catch {
    throw new ErroDePagamento("Resposta da InfinitePay não veio em JSON.");
  }

  // A documentação não fixa o nome do campo, então aceitamos as formas conhecidas.
  const url =
    (corpo.url as string) ??
    (corpo.link as string) ??
    (corpo.checkout_url as string) ??
    ((corpo.data as Record<string, string> | undefined)?.url ?? null);

  if (!url) {
    throw new ErroDePagamento(
      `Não achei o endereço de pagamento na resposta: ${texto.slice(0, 200)}`,
    );
  }

  return { url, slug: (corpo.slug as string) ?? null };
}

export type ConfirmacaoDePagamento = {
  pago: boolean;
  valorPagoCents: number | null;
  meio: string | null;
};

// O webhook da InfinitePay não é assinado: qualquer um poderia forjar um aviso
// de "pagamento aprovado". Por isso todo aviso é conferido aqui, perguntando
// direto para a InfinitePay se o dinheiro entrou.
export async function conferirPagamento(params: {
  orderNsu: string;
  transactionNsu?: string;
  slug?: string;
}): Promise<ConfirmacaoDePagamento> {
  if (!pagamentoConfigurado()) {
    throw new ErroDePagamento("Pagamento online ainda não configurado.");
  }

  const resposta = await fetch(`${BASE}/payment_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      handle: process.env.INFINITEPAY_HANDLE,
      order_nsu: params.orderNsu,
      transaction_nsu: params.transactionNsu,
      slug: params.slug,
    }),
    cache: "no-store",
  });

  if (!resposta.ok) {
    throw new ErroDePagamento(
      `InfinitePay respondeu ${resposta.status} ao conferir o pagamento.`,
    );
  }

  const corpo = await resposta.json();
  return {
    pago: corpo.paid === true,
    valorPagoCents:
      typeof corpo.paid_amount === "number" ? corpo.paid_amount : null,
    meio: typeof corpo.capture_method === "string" ? corpo.capture_method : null,
  };
}
