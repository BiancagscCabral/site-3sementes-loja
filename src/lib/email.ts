// Envio de e-mail pelo Resend.
//
// O domínio 3sementes.com.br já está verificado lá, porque o Supabase manda os
// e-mails de login por ele. Aqueles saem do Supabase; estes saem do site, e por
// isso precisam de uma chave de API própria.
//
// Regra de ouro deste arquivo: e-mail nunca derruba uma venda. Se o Resend
// estiver fora do ar, sem chave ou recusar a mensagem, o pedido continua
// gravado e a cliente segue para o pagamento. O erro vai para o log e acabou.

const ENDERECO_DA_API = "https://api.resend.com/emails";

export function emailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY);
}

function remetente() {
  return process.env.EMAIL_REMETENTE ?? "3sementes <pedidos@3sementes.com.br>";
}

type Mensagem = {
  para: string;
  assunto: string;
  html: string;
  responderPara?: string;
};

export async function enviarEmail({
  para,
  assunto,
  html,
  responderPara,
}: Mensagem): Promise<boolean> {
  if (!emailConfigurado()) {
    console.warn(`[email] sem RESEND_API_KEY, não enviei: "${assunto}"`);
    return false;
  }

  try {
    const resposta = await fetch(ENDERECO_DA_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetente(),
        to: [para],
        subject: assunto,
        html,
        ...(responderPara ? { reply_to: responderPara } : {}),
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error(`[email] Resend recusou (${resposta.status}): ${detalhe}`);
      return false;
    }

    return true;
  } catch (erro) {
    console.error("[email] falhou ao chamar o Resend:", erro);
    return false;
  }
}

// Dispara sem travar quem chamou. Usado no meio da criação do pedido: a
// cliente não pode ficar esperando o Resend responder para ver a tela de
// confirmação.
export function enviarEmailSemEsperar(mensagem: Mensagem) {
  void enviarEmail(mensagem).catch((erro) => {
    console.error("[email] erro não tratado:", erro);
  });
}
