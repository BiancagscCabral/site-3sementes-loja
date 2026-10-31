---
name: identidade-visual
description: Use ao criar ou alterar qualquer tela, componente, cor, fonte ou espaçamento da loja 3sementes / 3sflores, para respeitar os tokens e o tema da marca.
---

# Identidade visual

A fonte da verdade são os tokens em `src/app/globals.css`. **Leia o arquivo antes de mexer**;
os valores abaixo são um retrato de 31/10/2026 e podem ter mudado.

## Regras

- **Nunca escreva hex em componente.** Use as classes do Tailwind ligadas aos tokens:
  `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `bg-muted-bg`, `border-border`,
  `bg-primary`/`text-primary-foreground`, `bg-primary-dark`, `bg-secondary`, `text-accent`,
  `bg-accent`, `text-bloom`, `text-danger`, `bg-hero`. Hoje não existe hex solto em componente.
- **Dois temas, uma loja.** O padrão é o da 3sementes (verde-oliva + laranja queimado). Páginas da
  categoria Flores Eternas (3sflores) usam a classe `.theme-flores` (rosa-terroso), que só troca
  os valores dos mesmos tokens. Não crie classes de cor específicas da 3sflores: ajuste o token
  dentro de `.theme-flores`.
- **Laranja/accent com parcimônia** (botões de ação, preço, selo). O rosa `#d08678` da 3sflores
  é decorativo (`--bloom`); texto e botões usam um tom mais fechado para manter o contraste.
- **Contraste**: texto sobre fundo precisa ser legível. Ao propor um token novo, confira o
  contraste (mínimo 4.5:1 para texto normal).
- **Fontes** ficam em `src/fonts/` e carregam por `next/font/local` no `layout.tsx` (nada de
  Google Fonts por CDN): Karla (`font-sans`, corpo), Libre Baskerville (`--font-libre`) e
  Cormorant Garamond (`--font-cormorant`). Títulos usam `font-display`.
- **Pendência conhecida:** `--display-font` aponta para `var(--font-Inter)` e o Inter não é
  carregado. Antes de mexer em títulos, pergunte à Bianca qual fonte ela quer.
- Mantenha `cursor: pointer` em elementos clicáveis (já há regra global) e respeite
  `prefers-reduced-motion` em animações novas, como o `.flip-card` faz.
- Layout inspirado no Hippie Artesanatos, porém **com menos densidade de informação**; a barra
  de topo é obrigatória.

## Como entregar a mudança

A Bianca prefere aplicar CSS/HTML por conta própria. Em ajuste visual, mostre **só o trecho que
muda e em qual arquivo/linha**, em vez de regenerar o arquivo inteiro, a não ser que ela peça.
