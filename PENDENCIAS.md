# Pendências do site — 3sementes Store

Atualizado em 21/09/2026.

## 1. Depende de você (me mandar ou decidir)

- [ ] **Fotos dos produtos** — nomes definidos em `nomes-das-fotos.md`, salvar em `public/img/products/`
- [ ] **Vídeos** — decidir entre Instagram (sem custo de banda) ou hospedar; não vão no repositório
- [ ] **Descrições** dos produtos (o bloco "Sobre a peça" fica escondido enquanto não houver)
- [ ] **InfiniteTag** da InfinitePay (usuário do app, sem o `$`)
- [ ] **Token da SuperFrete** (ambiente sandbox primeiro)
- [ ] **CEP de origem** (de onde você posta)
- [ ] **Peso (g) e medidas (cm)** por categoria — ex: bracelete 30g / 16×11×2cm, buquê 300g / 30×20×10cm
- [ ] **CNPJ e razão social** — hoje está `[PREENCHER]` na política de privacidade
- [ ] **Nomes completos** dos produtos que vieram cortados do catálogo da Shopee:
  - "Bracelete Mari com..."
  - "Bracelete Lia Ornamental | Dourado e..."
  - "Luminária Flor Mágica Inspirada em..."
- [ ] **Opções de "sob medida"** — quais tamanhos e cores existem, pra virar seletor no site
- [ ] **Catálogo do TikTok Shop**
- [ ] **Confirmar com o contador** — nota fiscal ou declaração de conteúdo no envio
- [ ] **Saldo na carteira SuperFrete** — só quando for emitir etiqueta de verdade

## 2. Pra vender de verdade

- [ ] **Pagamento (InfinitePay)**
  - Criar o pedido no banco como "aguardando pagamento"
  - Gerar o link de pagamento (`POST /links`)
  - Receber a confirmação (webhook) e **conferir pelo `payment_check`** antes de marcar como pago
  - Página de "pedido confirmado"
- [ ] **Frete (SuperFrete)**
  - Cotação aparecendo no checkout depois do CEP (`POST /calculator`)
  - Adicionar campo de **CPF** no checkout (a etiqueta exige)
  - Registrar o frete na sua conta assim que o pagamento confirmar (`POST /cart`)
  - Emitir etiqueta e guardar o código de rastreio (`POST /checkout`)
- [ ] **Painel administrativo** com login (Supabase Auth)
  - Lista de pedidos pagos, com cliente, itens, valor e endereço
  - Mudar status conforme produz e envia
  - Botão de gerar etiqueta e ver rastreio
  - Filtro separado pros não pagos (pra recuperar venda)
- [ ] **Controle de estoque** — o número existe no banco mas não baixa quando vende

## 3. Pra colocar no ar

- [ ] **Publicar na Vercel** e configurar as variáveis de ambiente no servidor
- [ ] **Domínio próprio**
- [ ] **Preview de link** — hoje, ao colar o link no Instagram ou WhatsApp, não aparece imagem nem descrição
- [ ] Lembrete: o Supabase gratuito pausa depois de ~1 semana sem acesso. Com o site no ar recebendo visitas, isso deixa de acontecer

## 4. Ajustes menores

- [ ] **Favoritos** — o coração no topo ainda não funciona
- [ ] **Ícone de conta** — esconder ou transformar no seu login de administradora
- [ ] **Selo "Novo"** — hoje aparece em tudo, porque todos os produtos entraram no banco no mesmo dia; melhor virar marcação manual
- [ ] **Categoria Anéis está vazia** — cadastrar anéis ou tirar do menu
- [ ] **Ordenar e filtrar** na página de categoria (por preço, por exemplo)
- [ ] **Confirmação por e-mail** do pedido pro cliente

## Já está pronto

- Catálogo com 56 produtos e 9 categorias no Supabase
- Home com banner rotativo, categorias e vitrine
- Páginas de categoria e de produto
- Identidade visual própria da 3sflores na categoria Flores Eternas
- Busca funcionando (ignora acentos) e menu mobile
- Carrinho e tela de finalizar pedido, com CEP preenchendo o endereço sozinho
- Páginas de entrega/trocas e política de privacidade

## Referência técnica

**InfinitePay** — `POST https://api.checkout.infinitepay.io/links` (handle, items com preço em centavos, order_nsu, customer, address, redirect_url, webhook_url). Confirmação por webhook + `POST /payment_check`. Não tem chave secreta, então todo aviso de pagamento precisa ser conferido antes de valer.

**SuperFrete** — `https://sandbox.superfrete.com` (teste) e `https://api.superfrete.com` (produção). Token Bearer + header User-Agent. Cotação em `POST /api/v0/calculator` (peso em kg, medidas em cm; serviços: 1 PAC, 2 SEDEX, 17 Mini Envios). Etiqueta: `POST /api/v0/cart` e depois `POST /api/v0/checkout`, debitando do saldo da carteira.
