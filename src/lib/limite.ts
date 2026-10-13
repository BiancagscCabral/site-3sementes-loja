// Trava simples contra enxurrada de requisições nas rotas públicas.
//
// A contagem fica na memória do servidor, então ela se perde a cada reinício e
// não é compartilhada entre as máquinas da Vercel. Não substitui uma proteção
// de verdade (Cloudflare, Vercel WAF), mas já impede que alguém encha o banco
// de pedidos falsos com um laço de repetição.

type Registro = { contagem: number; reiniciaEm: number };

const memoria = new Map<string, Registro>();

export function quemEstaChamando(request: Request) {
  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconhecido";
}

export function passouDoLimite(
  chave: string,
  maximo: number,
  janelaSegundos: number,
) {
  const agora = Date.now();
  const registro = memoria.get(chave);

  if (!registro || agora > registro.reiniciaEm) {
    memoria.set(chave, {
      contagem: 1,
      reiniciaEm: agora + janelaSegundos * 1000,
    });
    limparVelhos(agora);
    return false;
  }

  registro.contagem += 1;
  return registro.contagem > maximo;
}

// Sem isso o mapa cresceria para sempre em um servidor de vida longa.
function limparVelhos(agora: number) {
  if (memoria.size < 500) return;
  for (const [chave, registro] of memoria) {
    if (agora > registro.reiniciaEm) memoria.delete(chave);
  }
}
