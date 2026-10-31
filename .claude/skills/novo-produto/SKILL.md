---
name: novo-produto
description: Use ao cadastrar, renomear, mudar preço ou ligar fotos de um produto da loja 3sementes (seed, schema Prisma, fotos em public/img/products).
---

# Cadastrar ou alterar produto

## Onde cada campo mora (importante)

| Campo | Fonte da verdade | Como mudar |
|---|---|---|
| nome, preço, categoria | `prisma/seed.ts` (`CATALOG`) | editar o seed e rodar `npm run db:seed` |
| descrição, estoque, peso, medidas, tamanhos, cores | só o banco | Prisma Studio / SQL (não há tela no admin) |
| fotos | arquivos em `public/img/products/` | salvar o arquivo e rodar `npm run fotos` |

**Cuidado:** o seed faz `upsert` por slug e **sobrescreve nome, preço e categoria** de produto
que já existe. Mudou um preço direto no banco? O próximo `db:seed` desfaz. Mude no seed.

Só existe um banco (Supabase). **Não rode `db:seed`, `db:push` ou `db:migrate` sem a Bianca
confirmar** — descreva o que vai acontecer e peça o ok.

## Passo a passo

1. **Preço em centavos, inteiro.** R$ 45,90 → `4590`. Nunca decimal.
2. **Slug** = nome sem acento, minúsculo, hífens (a função `slugify` do seed). Ele define o nome
   do arquivo da foto, então decida o slug antes de salvar a foto.
3. **Categoria**: use um slug que já exista no `CATALOG` (guias, braceletes, colares, anéis,
   flores-eternas...). Categoria nova também precisa de entrada em `src/lib/embalagem.ts`
   (`POR_CATEGORIA`), senão o frete usa a embalagem de joia por padrão.
4. **Peso e medidas** (`weightGrams`, `heightCm`, `widthCm`, `lengthCm`): se a Bianca não passou,
   **pergunte**. Não invente. Sem eles, o frete usa a estimativa da categoria, e frete cobrado a
   menos sai do bolso dela.
5. **Fotos**: `.jpg`/`.webp`, até 1600px de largura.
   - principal: `slug.jpg` (ex: `bracelete-oxossi.jpg`)
   - extras: `slug-2.jpg`, `slug-3.jpg`
   - de uma opção (tema/cor): `slug__opcao.jpg` (a foto troca quando a cliente escolhe a opção)
   - subpastas são só organização; vale o nome do arquivo.
   - fotos grandes: `npm run fotos:otimizar`. A lista de nomes esperados está em
     `nomes-das-fotos.md`.
6. **Descrição vazia esconde** o bloco "Sobre a peça". Isso é esperado enquanto ela não escrever.
7. Em produto de **guia/artigo religioso**, não escreva descrição sobre a entidade ou o
   significado por conta própria: o texto precisa vir da Bianca.
8. Ao terminar, marque o item em `PENDENCIAS.md` se for o caso.
