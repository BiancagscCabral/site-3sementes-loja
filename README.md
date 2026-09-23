# Loja 3sementes

E-commerce da **3sementes**: Produtos artesanais (braceletes, colares, anéis, guias/artigos
religiosos) e **Flores Eternas** — a linha de flores de chenille feita à mão (também conhecida
como 3sflores). Não são duas lojas: 3sflores é uma categoria dentro da 3sementes.

Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma 7 (PostgreSQL via
Supabase).

## O que já está pronto

**Projeto e banco**
- Next.js com Tailwind configurado (`create-next-app`, App Router, `src/`)
- Schema do Prisma (`prisma/schema.prisma`): `Category`, `Product` (com fotos, variantes, peso e
  dimensões — já prontos para a cotação de frete da SuperFrete), `Order` e `OrderItem` (com
  campos para pagamento InfinitePay e frete SuperFrete)
- Prisma 7 configurado com driver adapter (`@prisma/adapter-pg`) e `prisma.config.ts` — a conexão
  do banco não fica mais no `schema.prisma`, e sim em `prisma.config.ts` (migrations) e
  `src/lib/prisma.ts` (runtime da aplicação)
- Banco conectado no **Supabase** (Postgres gerenciado, plano gratuito), com as tabelas já
  criadas via `db push`
- Script de seed (`prisma/seed.ts`) com produtos de exemplo em cada categoria — **dados
  fictícios**, só para ter algo pra visualizar; os produtos reais ainda precisam ser cadastrados

**Design**
- Identidade visual: verde-oliva (`#606542`) como cor principal, sage (`#A4A077`) como
  secundária, laranja (`#F37F19`) como destaque (botões, preços, badges)
- Header estilo marketplace: barra de topo fixa, logo, busca (visual, ainda sem backend),
  ícones de conta/favoritos/carrinho (visuais, sem função ainda) e menu de categorias
- Rodapé com bloco "Sobre", ícones de WhatsApp/Instagram, colunas de categorias/atendimento/
  localização e botão "voltar ao topo"
- **Falta**: menu mobile (a busca e as categorias somem em telas pequenas hoje)

**Catálogo (início da Fase 2)**
- `/categorias/[slug]` — lista os produtos de uma categoria, lendo do banco via Prisma
- `/produtos/[slug]` — página do produto com preço, descrição e botão "Comprar pelo WhatsApp"
  (a mensagem já vem preenchida com o nome do produto)
- Categorias atuais: Braceletes, Colares, Anéis, Guias, Flores Eternas

**Contato**
- WhatsApp: (81) 92005-1830
- Instagram: [@3sementes_store](https://www.instagram.com/3sementes_store/) e
  [@3sflores](https://www.instagram.com/3sflores/)

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL` e `DIRECT_URL` com as connection strings do Supabase (Project Settings →
     Connect). A `DATABASE_URL` usa o pooler em modo *transaction* (porta 6543) e é usada em
     runtime pela aplicação; a `DIRECT_URL` usa o pooler em modo *session* (porta 5432) e é usada
     pelo Prisma para migrations/seed
   - `INFINITEPAY_HANDLE` com sua InfiniteTag (ainda não usado no código)
   - `SUPERFRETE_TOKEN` com o token gerado em superfrete.com — comece pelo ambiente Sandbox
     (ainda não usado no código)

3. Crie as tabelas no banco a partir do schema:
   ```bash
   npm run db:push
   ```

4. (Opcional) Popule o banco com produtos de exemplo:
   ```bash
   npm run db:seed
   ```

5. Rode o projeto:
   ```bash
   npm run dev
   ```
   Acesse http://localhost:3000

## Próximas fases (sugestão de ordem)

- **Fase 2 — Catálogo (em andamento)**: cadastrar os produtos reais (fotos, preços, descrições)
  no lugar dos dados de exemplo; busca funcional na barra do header; menu mobile
- **Fase 3 — Carrinho**: estado do carrinho no cliente + página de resumo do pedido
- **Fase 4 — Pagamento (InfinitePay)**: rota de API que cria o `Order` no banco e chama
  `POST https://api.checkout.infinitepay.io/links` para gerar o link de pagamento;
  webhook (ou `payment_check`) para confirmar o pagamento e atualizar `paymentStatus`
- **Fase 5 — Frete (SuperFrete)**: rota de API que recebe o CEP do cliente e os produtos do
  carrinho, chama a cotação da SuperFrete (ambiente sandbox primeiro) e retorna as opções de frete
- **Fase 6 — Painel de pedidos**: página simples (protegida por senha) para ver os pedidos e
  seus status
- **Fase 7 — Atendimento**: botão de WhatsApp já existe no rodapé e nas páginas de produto;
  falta avaliar se querem um botão flutuante fixo em todas as páginas

## Notas importantes

- Preços são armazenados em **centavos** (`priceCents`, `totalCents`) para evitar erros de
  arredondamento com números decimais — ao exibir, divida por 100.
- O cliente Prisma é gerado em `src/generated/prisma` (pasta ignorada pelo git) — rode
  `npx prisma generate` se ela não existir (o `postinstall` já faz isso automaticamente).
- Teste a integração da SuperFrete no ambiente **Sandbox** antes de gerar etiquetas reais.
- Teste a InfinitePay também com valores baixos antes de divulgar o site.
