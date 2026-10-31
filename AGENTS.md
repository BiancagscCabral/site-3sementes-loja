<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Loja 3sementes — convenções do projeto

Esta seção é nossa (fora do bloco gerado pelo `next dev`, que reescreve só o que está entre
`BEGIN`/`END`). Tudo aqui foi tirado do código real; se o código mudar, atualize esta seção.

## O que é

E-commerce da **3sementes** (braceletes, colares, guias/artigos religiosos). **3sflores é uma
categoria dentro da 3sementes** ("Flores Eternas", flores de chenille), não uma segunda loja:
ela só ganha um tema visual próprio (`.theme-flores`).

Código, comentários e nomes de variáveis são em **português**; textos da tela em pt-BR.

## Comandos

- `npm run dev` / `build` / `lint`. **Não há suíte de testes.**
- `npm run db:push`, `db:migrate`, `db:seed`, `db:studio` — **só existe um banco (Supabase)**.
  Não rode contra ele sem a Bianca pedir. Prefira só ler.
- `npm run fotos` liga fotos aos produtos; `npm run fotos:otimizar` reduz fotos grandes.
- `npm run frete:testar` testa a cotação do SuperFrete.
- Prisma 7: o client é gerado em `src/generated/prisma` (fora do git; `postinstall` gera).
- Branch principal: `main`.

## Regras que não podem quebrar

**Dinheiro**
- Todo valor é **inteiro em centavos** (`priceCents`, `totalCents`, `shippingCents`). Nunca Float.
- O servidor **recalcula o preço a partir do banco** (`src/lib/pedidos.ts`). Nunca confie em
  preço, frete ou total que veio do navegador.
- Preço por tamanho: `priceForSize` em `src/lib/catalog.ts`.

**Pagamento (InfinitePay)** — detalhes na skill `fluxo-de-pagamento`
- O webhook **não é assinado**. Ele só diz "vá conferir o pedido X". Quem decide se pagou é
  `conferirPagamento()` (`POST /payment_check`). Nunca marque `PAID` olhando só o corpo do aviso.
- Pedido pago (`pedidoFoiPago`) **não se apaga** e não volta para "não pago"
  (`src/lib/regras-pedido.ts`).
- Pedidos de WhatsApp (`AWAITING_CONTACT`) **nunca expiram**: é o canal que mais vende.

**Frete (SuperFrete)**
- Só roda no servidor; o token nunca vai ao navegador. Sandbox primeiro (`SUPERFRETE_ENV`).
- As medidas padrão em `src/lib/embalagem.ts` são **estimativas**. Frete cobrado a menos sai do
  bolso dela: não invente peso/medida de produto, pergunte.
- Uber Flash só para a lista de cidades em `src/lib/entrega.ts`.

**Segredos e acesso**
- Nunca leia, imprima ou comite `.env*` (só `.env.example`). Nunca cole token/chave em resposta.
- Toda ação do painel admin confere `ehAdmin(usuario.email)` (`src/lib/supabase/servidor.ts`).
  Ação nova no admin sem essa checagem é bug de segurança.
- `src/lib/limite.ts` é um limitador **em memória**: não é compartilhado entre máquinas da
  Vercel. Serve só contra laço de repetição simples, não como proteção real.
- `src/lib/regras-pedido.ts` não pode importar nada de servidor (roda na tela também).

## Visual — detalhes na skill `identidade-visual`

- Cores só por **tokens** em `src/app/globals.css` (`bg-primary`, `text-accent`...). Hoje não há
  hex solto em componente; mantenha assim.
- Fontes ficam no projeto (`src/fonts/`, via `next/font/local`): Karla (corpo), Libre Baskerville
  e Cormorant Garamond.
- **Inconsistência conhecida, ainda não corrigida:** `--display-font` aponta para
  `var(--font-Inter)`, mas o Inter não é carregado no `layout.tsx`. Os títulos da 3sementes
  (`font-display`) provavelmente não usam a fonte que ela escolheu (`--font-libre` está carregada
  e sem uso no CSS). Confirme com a Bianca qual é a intenção antes de mexer.

## Como o produto entra no site — detalhes na skill `novo-produto`

- `prisma/seed.ts` é a **fonte da verdade de nome, preço e categoria**: o `upsert` por slug
  **sobrescreve** esses três campos a cada `db:seed`. Descrição, estoque e medidas só vivem no
  banco (não há tela de produtos no admin).
- Foto: o **nome do arquivo é o slug do produto** (`bracelete-oxossi.jpg`); `-2`, `-3` são fotos
  extras; `slug__opcao.jpg` liga a foto a uma opção.

## Como trabalhar

- `PENDENCIAS.md` é a lista de apoio, mas **pode estar defasada** (última atualização
  21/09/2026, e ainda lista pagamento, webhook e painel admin como pendentes, que já existem no
  código). Confira o código antes de confiar num item e atualize o arquivo ao concluir algo.
- Mudanças em pagamento/pedido/webhook: peça revisão ao agente `revisor-de-pagamento` antes de
  dizer que terminou.
- A Bianca prefere **aplicar mudanças de CSS/HTML por conta própria**: em ajuste visual, mostre o
  trecho que muda (e onde), não regenere o arquivo inteiro.
