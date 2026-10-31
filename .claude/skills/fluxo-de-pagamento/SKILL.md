---
name: fluxo-de-pagamento
description: Use ao mexer em checkout, criação de pedido, webhook da InfinitePay, status de pagamento, frete do SuperFrete ou estoque. Resume o fluxo real e as regras que não podem quebrar.
---

# Pedido, pagamento e frete

Arquivos: `src/lib/pedidos.ts`, `src/lib/infinitepay.ts`, `src/lib/superfrete.ts`,
`src/lib/regras-pedido.ts`, `src/app/api/{pedidos,pagamento,frete}/route.ts`,
`src/app/api/webhooks/infinitepay/route.ts`, `src/app/admin/acoes.ts`.

## Dois caminhos de pedido

1. **WhatsApp**: `POST /api/pedidos` → `criarPedido(..., "AWAITING_CONTACT")`. O pagamento
   acontece na conversa. Esses pedidos **nunca expiram** (é o canal que mais vende).
2. **Online (InfinitePay)**: `POST /api/pagamento` grava o pedido como `AWAITING_PAYMENT`,
   gera o link (`POST api.checkout.infinitepay.io/links`, com o frete como uma linha a mais para
   o total bater) e devolve a URL. A confirmação chega pelo webhook; `/pedido/[code]` é o retorno.
   Se a criação do link falhar, o pedido **já está gravado**: a rota responde 502 com o `codigo`
   para a cliente não perder o que preencheu e a loja poder fechar pelo WhatsApp. Preserve isso.

## Regras que não podem quebrar

1. **O webhook não é assinado.** Qualquer pessoa pode forjar um aviso. Ele só serve de gatilho:
   a decisão vem de `conferirPagamento()` (`POST /payment_check`). Nunca marque `PAID` com base
   no corpo do aviso.
2. **Preço, total e frete são recalculados no servidor** a partir do banco. Nunca use valor que
   veio do navegador.
3. **Webhook idempotente**: aviso repetido para pedido já `PAID` responde 200 e não faz nada;
   pedido inexistente responde 200 (para a InfinitePay parar de reenviar); erro nosso responde
   400 (para ela reenviar).
4. **Pagou menos que o total?** Registra `paymentStatus = PAID` mas mantém
   `status = AWAITING_PAYMENT` e loga. Fica para conferência manual no painel; não despache.
5. **Pedido pago não se apaga** e não volta a "não pago" (`podeExcluir`, `statusPermitidos`).
   `CANCELLED` continua disponível porque estorno existe.
6. `regras-pedido.ts` não importa código de servidor (é usado na tela e no servidor).
7. Dinheiro sempre em **centavos inteiros**.
8. `NEXT_PUBLIC_SITE_URL` precisa ser `https://` público para o link de pagamento e o webhook.

## Frete

- `cotarFrete()` só roda no servidor. Serviços: PAC (1), SEDEX (2), Mini Envios (17).
- Sem token/CEP de origem válidos o site continua no ar; o checkout só não mostra frete
  (`freteConfigurado()`).
- Sandbox primeiro (`SUPERFRETE_ENV=sandbox`). Teste com `npm run frete:testar`.
- **Não existe no código** (conferido em 31/10/2026): campo de CPF no checkout, registrar o frete
  (`POST /cart`) e emitir etiqueta (`POST /checkout`) após o pagamento, e **baixa de estoque**
  (o campo `stock` existe, mas nada o decrementa ao vender).

## Antes de dizer que terminou

Peça uma revisão ao agente `revisor-de-pagamento` e rode `npm run lint`. Teste pagamento com
valor baixo antes de divulgar o site. Nunca imprima `INFINITEPAY_HANDLE`, token ou chaves.
