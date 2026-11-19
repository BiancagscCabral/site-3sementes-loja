import { formatPriceCents } from "@/lib/format";

// Os e-mails que o site manda sobre um pedido.
//
// O HTML aqui é propositalmente antiquado: tabela dentro de tabela e estilo
// escrito em cada tag. Cliente de e-mail não entende CSS moderno, e o Gmail
// descarta folha de estilo, então é assim que se escreve e-mail que chega
// legível. As cores acompanham os modelos de login em emails/.

const CREME = "#fff8f1";
const OLIVA = "#3e4229";
const AREIA = "#e6b48a";
const ESCURO = "#262719";
const TEXTO = "#4f5139";
const BORDA = "#c9c2ac";
const LARANJA = "#c4611a";
const RODAPE = "#f1ead9";

export type ItemDoEmail = {
  productName: string;
  variantName: string | null;
  size: string | null;
  quantity: number;
  unitPriceCents: number;
};

export type PedidoDoEmail = {
  code: string;
  customerName: string;
  totalCents: number;
  shippingCents: number | null;
  shippingService: string | null;
  items: ItemDoEmail[];
};

function enderecoDoSite() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Só o primeiro nome: "Oi, Maria" soa melhor que o nome completo do cadastro.
function primeiroNome(nome: string) {
  return escapar(nome.trim().split(/\s+/)[0] ?? "");
}

function linhasDosItens(itens: ItemDoEmail[]) {
  return itens
    .map((item) => {
      const detalhes = [item.variantName, item.size]
        .filter(Boolean)
        .map((d) => escapar(String(d)))
        .join(" · ");

      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDA};font-size:14px;color:${TEXTO};text-align:left">
            ${item.quantity}x ${escapar(item.productName)}
            ${detalhes ? `<br><span style="font-size:12px;color:#8a8463">${detalhes}</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDA};font-size:14px;color:${TEXTO};text-align:right;white-space:nowrap">
            ${formatPriceCents(item.unitPriceCents * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");
}

function resumoDoPedido(pedido: PedidoDoEmail) {
  const frete =
    pedido.shippingCents === null
      ? `<tr>
          <td style="padding:10px 0;font-size:14px;color:${TEXTO};text-align:left">Entrega${
            pedido.shippingService ? ` (${escapar(pedido.shippingService)})` : ""
          }</td>
          <td style="padding:10px 0;font-size:14px;color:${TEXTO};text-align:right">a combinar</td>
        </tr>`
      : `<tr>
          <td style="padding:10px 0;font-size:14px;color:${TEXTO};text-align:left">Entrega${
            pedido.shippingService ? ` (${escapar(pedido.shippingService)})` : ""
          }</td>
          <td style="padding:10px 0;font-size:14px;color:${TEXTO};text-align:right">${formatPriceCents(
            pedido.shippingCents,
          )}</td>
        </tr>`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${linhasDosItens(pedido.items)}
      ${frete}
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:bold;color:${ESCURO};text-align:left">Total</td>
        <td style="padding:12px 0 0;font-size:15px;font-weight:bold;color:${ESCURO};text-align:right">
          ${formatPriceCents(pedido.totalCents)}
        </td>
      </tr>
    </table>`;
}

// A tabela do botão precisa de margin auto E do align: o Outlook ignora a
// margem, e alguns clientes ignoram o align.
function botao(texto: string, endereco: string) {
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:22px auto 0">
      <tr>
        <td style="background-color:${LARANJA}">
          <a href="${endereco}" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:bold;color:${CREME};text-decoration:none">
            ${texto}
          </a>
        </td>
      </tr>
    </table>`;
}

function moldura(conteudo: string) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;padding:0;background-color:${CREME};font-family:Helvetica,Arial,sans-serif">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:1px solid ${BORDA}">

        <tr>
          <td align="center" style="background-color:${OLIVA};padding:22px 28px;text-align:center">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:${CREME}">3sementes</span>
            <span style="font-size:11px;letter-spacing:3px;color:${AREIA};margin-left:6px">STORE</span>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:32px 28px;text-align:center">
            ${conteudo}
          </td>
        </tr>

        <tr>
          <td align="center" style="background-color:${RODAPE};padding:18px 28px;text-align:center">
            <p style="margin:0;font-size:12px;line-height:1.7;color:${TEXTO}">
              Peças feitas à mão em Pernambuco &middot; enviamos para todo o Brasil<br>
              Dúvidas? Chame no WhatsApp (81) 92005-1830
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:#8a8463">
              Este endereço não recebe respostas.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`;
}

function titulo(texto: string) {
  return `<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.3;color:${ESCURO}">${texto}</h1>`;
}

function paragrafo(texto: string) {
  return `<p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:${TEXTO}">${texto}</p>`;
}

function codigoEmDestaque(code: string) {
  return `
    <p style="margin:18px 0 0;font-size:13px;color:${TEXTO}">Código do pedido</p>
    <p style="margin:4px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;letter-spacing:1px;color:${LARANJA}">
      ${escapar(code)}
    </p>`;
}

// Pedido gravado, pagamento ainda não confirmado.
export function emailPedidoRecebido(pedido: PedidoDoEmail) {
  const link = `${enderecoDoSite()}/pedido/${pedido.code}`;

  return {
    assunto: `Recebemos seu pedido ${pedido.code}`,
    html: moldura(`
      ${titulo("Recebemos seu pedido")}
      ${paragrafo(
        `Oi, ${primeiroNome(pedido.customerName)}! Seu pedido está registrado. Guarde o código abaixo: é por ele que você acompanha tudo.`,
      )}
      ${codigoEmDestaque(pedido.code)}
      <div style="margin-top:24px;border-top:1px solid ${BORDA};padding-top:4px">
        ${resumoDoPedido(pedido)}
      </div>
      ${paragrafo(
        "Assim que o pagamento for confirmado, a gente começa a preparar sua peça e avisa por aqui.",
      )}
      ${botao("Acompanhar meu pedido", link)}
    `),
  };
}

// Pagamento confirmado pela InfinitePay.
export function emailPagamentoConfirmado(pedido: PedidoDoEmail) {
  const link = `${enderecoDoSite()}/pedido/${pedido.code}`;

  return {
    assunto: `Pagamento confirmado · pedido ${pedido.code}`,
    html: moldura(`
      ${titulo("Pagamento confirmado")}
      ${paragrafo(
        `Oi, ${primeiroNome(pedido.customerName)}! Seu pagamento caiu e já estamos preparando sua peça. Como tudo aqui é feito à mão, cada uma leva o tempo que precisa.`,
      )}
      ${codigoEmDestaque(pedido.code)}
      <div style="margin-top:24px;border-top:1px solid ${BORDA};padding-top:4px">
        ${resumoDoPedido(pedido)}
      </div>
      ${paragrafo("Quando o pedido for postado, a gente te avisa.")}
      ${botao("Acompanhar meu pedido", link)}
    `),
  };
}

// Aviso para a loja, não para a cliente.
export function emailNovoPedidoParaLoja(
  pedido: PedidoDoEmail & { customerPhone: string; customerEmail: string | null },
) {
  const link = `${enderecoDoSite()}/admin`;

  return {
    assunto: `Novo pedido ${pedido.code} · ${formatPriceCents(pedido.totalCents)}`,
    html: moldura(`
      ${titulo("Entrou um pedido novo")}
      ${codigoEmDestaque(pedido.code)}
      ${paragrafo(
        `<strong>${escapar(pedido.customerName)}</strong><br>` +
          `${escapar(pedido.customerPhone)}` +
          (pedido.customerEmail ? `<br>${escapar(pedido.customerEmail)}` : ""),
      )}
      <div style="margin-top:24px;border-top:1px solid ${BORDA};padding-top:4px">
        ${resumoDoPedido(pedido)}
      </div>
      ${botao("Abrir o painel", link)}
    `),
  };
}
