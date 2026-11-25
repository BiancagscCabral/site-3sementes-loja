import { formatPriceCents } from "@/lib/format";
import { linkDoWhatsApp, mensagemSobreOPedido } from "@/lib/telefone";

// Os e-mails que o site manda sobre um pedido.
//
// O HTML aqui é propositalmente antiquado: tabela dentro de tabela e estilo
// escrito em cada tag. Cliente de e-mail não entende CSS moderno, e o Gmail
// descarta folha de estilo, então é assim que se escreve e-mail que chega
// legível. As cores e o desenho acompanham o site (creme, terracota, rosa e
// amarelo) e os modelos de login em emails/. O topo é uma imagem (logo com as
// ondas) que fica em public/img/email/topo.png.

const FUNDO = "#fff0dc";
const CARTAO = "#fff8ee";
const TERRACOTA = "#a52800";
const ESCURO = "#49352e";
const TEXTO = "#49352e";
const SUAVE = "#6b4e43";
const BORDA = "#dcc2a2";
const LINHA = "#ead6bb";
const RODAPE = "#f8e2c8";
const CLARO = "#fff8f0";
const FONTE_TITULO =
  "'Fredoka','Trebuchet MS','Arial Rounded MT Bold',Arial,sans-serif";
const FONTE_TEXTO = "'DM Sans',Helvetica,Arial,sans-serif";

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

export function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Só o primeiro nome: "Oi, Maria" soa melhor que o nome completo do cadastro.
export function primeiroNome(nome: string) {
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
          <td style="padding:10px 0;border-bottom:1px solid ${LINHA};font-size:14px;color:${TEXTO};text-align:left">
            ${item.quantity}x ${escapar(item.productName)}
            ${detalhes ? `<br><span style="font-size:12px;color:${SUAVE}">${detalhes}</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINHA};font-size:14px;color:${TEXTO};text-align:right;white-space:nowrap">
            ${formatPriceCents(item.unitPriceCents * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");
}

export function resumoDoPedido(pedido: PedidoDoEmail) {
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
// margem, e alguns clientes ignoram o align. O arredondado do botão vale onde
// há suporte; onde não há, vira um botão reto, igual funcional.
export function botao(texto: string, endereco: string) {
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:24px auto 0">
      <tr>
        <td align="center" style="background-color:${TERRACOTA};border-radius:999px">
          <a href="${endereco}" style="display:inline-block;padding:15px 36px;font-size:16px;font-weight:bold;color:${CLARO};text-decoration:none;border-radius:999px">
            ${texto}
          </a>
        </td>
      </tr>
    </table>`;
}

export function moldura(conteudo: string) {
  const topo = `${enderecoDoSite()}/img/email/topo.png`;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;padding:0;background-color:${FUNDO};font-family:${FONTE_TEXTO}">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:${CARTAO};border:1px solid ${BORDA};border-radius:24px;overflow:hidden">

        <tr>
          <td align="center" style="background-color:${CARTAO};padding:0;line-height:0;font-size:0">
            <img src="${topo}" width="520" alt="3Sementes Store" style="display:block;width:100%;max-width:520px;height:auto;border:0;font-family:Georgia,serif;font-size:24px;line-height:1.4;color:${TERRACOTA}">
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:28px 32px 32px;text-align:center">
            ${conteudo}
          </td>
        </tr>

        <tr>
          <td align="center" style="background-color:${RODAPE};padding:18px 32px;text-align:center">
            <p style="margin:0;font-size:12px;line-height:1.7;color:${SUAVE}">
              Peças feitas à mão em Pernambuco &middot; enviamos para todo o Brasil<br>
              Dúvidas? Chame no WhatsApp (81) 92005-1830
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:${SUAVE}">
              Este endereço não recebe respostas.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`;
}

// Segunda opção, abaixo do botão: presente sem competir com ele.
export function linkDiscreto(texto: string, endereco: string) {
  return `
    <p style="margin:16px 0 0;font-size:13px;text-align:center">
      <a href="${endereco}" style="color:${SUAVE};text-decoration:underline">${texto}</a>
    </p>`;
}

export function titulo(texto: string) {
  return `<h1 style="margin:0;font-family:${FONTE_TITULO};font-size:28px;font-weight:600;line-height:1.25;color:${TERRACOTA}">${texto}</h1>`;
}

export function paragrafo(texto: string) {
  return `<p style="margin:14px 0 0;font-size:16px;line-height:1.7;color:${TEXTO}">${texto}</p>`;
}

export function codigoEmDestaque(code: string) {
  return `
    <p style="margin:20px 0 0;font-size:13px;color:${SUAVE}">Código do pedido</p>
    <p style="margin:6px 0 0;font-family:${FONTE_TITULO};font-size:26px;font-weight:600;letter-spacing:1px;color:${TERRACOTA}">
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
      <div style="margin-top:24px;border-top:1px solid ${LINHA};padding-top:4px">
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
      <div style="margin-top:24px;border-top:1px solid ${LINHA};padding-top:4px">
        ${resumoDoPedido(pedido)}
      </div>
      ${paragrafo("Quando o pedido for postado, a gente te avisa.")}
      ${botao("Acompanhar meu pedido", link)}
    `),
  };
}

// Aviso para a loja quando o pagamento entra.
//
// É este que importa no dia a dia: pedido feito é intenção, pedido pago é
// venda. Por isso ele traz o botão do WhatsApp em destaque, para tirar uma
// dúvida sobre a peça sem procurar o número em lugar nenhum.
export function emailPagamentoAprovadoParaLoja(pedido: {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalCents: number;
  shippingCents: number | null;
  shippingService: string | null;
  items: ItemDoEmail[];
  valorPagoCents: number | null;
  meioDePagamento: string | null;
  valorConfere: boolean;
}) {
  const painel = `${enderecoDoSite()}/admin`;
  const whatsapp = linkDoWhatsApp(
    pedido.customerPhone,
    mensagemSobreOPedido(pedido.customerName, pedido.code),
  );

  const comoPagou =
    pedido.meioDePagamento === "credit_card"
      ? "cartão"
      : pedido.meioDePagamento === "pix"
        ? "Pix"
        : pedido.meioDePagamento;

  // Pagou menos que o total: o pedido fica retido para conferência e o aviso
  // precisa dizer isso em primeiro lugar, senão a peça sai sem o valor fechar.
  const alerta = pedido.valorConfere
    ? ""
    : `
      <div style="margin-top:20px;border:2px solid ${TERRACOTA};border-radius:10px;padding:14px 16px;text-align:left">
        <p style="margin:0;font-size:15px;font-weight:bold;color:${TERRACOTA}">
          Confira antes de preparar
        </p>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${TEXTO}">
          Entrou ${pedido.valorPagoCents === null ? "um valor que a InfinitePay não informou" : formatPriceCents(pedido.valorPagoCents)},
          e o pedido é de ${formatPriceCents(pedido.totalCents)}. Ele ficou parado
          como não pago no painel até você conferir.
        </p>
      </div>`;

  return {
    assunto: pedido.valorConfere
      ? `Pagamento aprovado · ${pedido.code} · ${formatPriceCents(pedido.totalCents)}`
      : `CONFERIR pagamento · ${pedido.code}`,
    html: moldura(`
      ${titulo(pedido.valorConfere ? "Pagamento aprovado" : "Pagamento a conferir")}
      ${codigoEmDestaque(pedido.code)}
      ${alerta}
      ${paragrafo(
        `<strong>${escapar(pedido.customerName)}</strong><br>` +
          `${escapar(pedido.customerPhone)}` +
          (pedido.customerEmail ? `<br>${escapar(pedido.customerEmail)}` : "") +
          (comoPagou ? `<br>pago por ${escapar(comoPagou)}` : ""),
      )}
      <div style="margin-top:24px;border-top:1px solid ${LINHA};padding-top:4px">
        ${resumoDoPedido(pedido)}
      </div>
      ${
        whatsapp
          ? botao("Falar com a cliente no WhatsApp", whatsapp)
          : paragrafo(
              "O telefone veio incompleto, então não dá para abrir a conversa daqui.",
            )
      }
      ${linkDiscreto("Abrir o painel", painel)}
    `),
  };
}
