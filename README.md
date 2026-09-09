# Loja 3sementes & 3sflores

Base do e-commerce: Next.js (App Router) + TypeScript + Tailwind CSS + Prisma (PostgreSQL).

## Fase 1 — o que já está pronto

- Projeto Next.js com Tailwind configurado (`create-next-app` com App Router e `src/`)
- Schema do Prisma (`prisma/schema.prisma`) com os modelos:
  - `Category` e `Product` (com fotos, variantes, peso e dimensões — o peso/dimensões já ficam
    prontos para a cotação de frete da SuperFrete)
  - `Order` e `OrderItem`, já com campos para o pagamento InfinitePay (`infinitePayOrderNsu`,
    `infinitePaySlug`, `paymentStatus`) e o frete SuperFrete (`shippingCents`, `shippingService`)

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install --legacy-peer-deps
   ```
   (o `--legacy-peer-deps` foi necessário no sandbox onde este projeto foi criado; no seu
   computador ou no Claude Code, teste primeiro sem essa flag — só use se der erro)

2. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL` com sua string de conexão do PostgreSQL (pode ser local, ou um Postgres
     gerenciado como Supabase/Neon/Railway — todos têm plano gratuito)
   - `INFINITEPAY_HANDLE` com sua InfiniteTag
   - `SUPERFRETE_TOKEN` com o token gerado em superfrete.com (comece pelo ambiente Sandbox)

3. Crie as tabelas no banco a partir do schema:
   ```bash
   npm run db:push
   ```

4. Rode o projeto:
   ```bash
   npm run dev
   ```
   Acesse http://localhost:3000

## Próximas fases (sugestão de ordem)

- **Fase 2 — Catálogo**: páginas de listagem e detalhe de produto, lendo do banco via Prisma
- **Fase 3 — Carrinho**: estado do carrinho no cliente + página de resumo do pedido
- **Fase 4 — Pagamento (InfinitePay)**: rota de API que cria o `Order` no banco e chama
  `POST https://api.checkout.infinitepay.io/links` para gerar o link de pagamento;
  webhook (ou `payment_check`) para confirmar o pagamento e atualizar `paymentStatus`
- **Fase 5 — Frete (SuperFrete)**: rota de API que recebe o CEP do cliente e os produtos do
  carrinho, chama a cotação da SuperFrete (ambiente sandbox primeiro) e retorna as opções de frete
- **Fase 6 — Painel de pedidos**: página simples (protegida por senha) para ver os pedidos e
  seus status
- **Fase 7 — Atendimento**: botão de WhatsApp fixo no site como primeira versão

## Notas importantes

- Preços são armazenados em **centavos** (`priceCents`, `totalCents`) para evitar erros de
  arredondamento com números decimais — ao exibir, divida por 100.
- Teste a integração da SuperFrete no ambiente **Sandbox** antes de gerar etiquetas reais.
- Teste a InfinitePay também com valores baixos antes de divulgar o site.
