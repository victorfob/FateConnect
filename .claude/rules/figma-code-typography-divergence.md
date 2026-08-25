---
description: Figma é protótipo; a implementação é a fonte de verdade para tipografia e para a tela de menu (desktop e mobile)
paths:
  - "FateConnect/Web/**"
---

# Figma ↔ código — tipografia e Menu

## Princípio (prioridade)

1. **Fonte de verdade:** o que **já está implementado** — os tokens e as variantes de tipografia do tema em `FateConnect/Web/design-system/`, e as telas existentes.
2. **Figma:** **protótipo** — fluxo, hierarquia visual, textos, disposição (desktop vs mobile) e marca. **Não** copiar `text-[Npx]` do export do MCP nem "igualar pixel a pixel" sem decisão explícita do time.
3. **Componente novo:** reutilizar a **mesma escala** das telas já feitas. Se o protótipo divergir, as tabelas abaixo documentam o desvio para ninguém "corrigir" o código em direção ao Figma por engano.

**Cores e sombras:** ver `.claude/rules/web-design-system.md`.

## Referência no Figma (somente protótipo)

- Arquivo: [FateConnect (Figma)](https://www.figma.com/design/lCN49BZA2Bn7UJv6McdT2j/FateConnect)
- **Desktop — Menu:** [node `3-1177`](https://www.figma.com/design/lCN49BZA2Bn7UJv6McdT2j/FateConnect?node-id=3-1177)
- **Mobile — Menu:** [node `3-2399`](https://www.figma.com/design/lCN49BZA2Bn7UJv6McdT2j/FateConnect?node-id=3-2399)

Leitura via **MCP do Figma**: `get_design_context`, carregando antes a skill `figma-design-to-code` (`fileKey` `lCN49BZA2Bn7UJv6McdT2j`, `nodeId` no formato `3:1177`). Os px que voltam são referência de protótipo; na implementação vale a escala do app. Convenção: **1rem = 16px**.

## Matriz protótipo Figma × implementação

A coluna **Implementação** é o que seguir. A coluna Figma evita surpresa quando alguém espera os px do arquivo.

Escala em `design-system/tokens/typography.ts`; a tela de menu em `src/pages/Menu/`.

| Elemento | Figma (desktop 3:1177) | Implementação | Nota |
| -------- | ---------------------- | ------------- | ---- |
| Logo do topo | 36px Bold | **1.3rem**, peso 600 | Manter a escala do app. |
| Links de navegação | 24px SemiBold | rótulo de botão, **1rem** peso 500 | Figma ilustrativo. |
| Título do herói | 60px Bold | `h1` **2rem**, peso 700 | Abaixo de 768px, 1.5rem. |
| Subtítulo do herói | 32px Medium, lh 45 | `subtitle` **1rem**, peso 500 | |
| Título do cartão | 40px SemiBold | `h2` **1.5rem**, peso 600 | |
| Ícone no cartão | elipse 120px + arte 70px | disco **70×70**, ícone **40px** de caixa | Não ampliar o disco para 120px sem decisão de produto. |
| Cartão | 600×370, raio 25px | `min-width` 300px, padding 2rem, raio 1rem | |
| Título do rodapé | 36px Bold | **1.5rem**, peso 700 | |
| Corpo do rodapé | 22px, lh 30 | `caption` **0.875rem** | |

## Protótipo: desktop vs mobile

Útil para **layout e comportamento** (empilhar, centralizar, hamburger). **Não** obriga a copiar dois patamares de `font-size`: a escala tipográfica do app é única, com a exceção do `h1`.

| Elemento | Figma desktop | Figma mobile | Implementação |
| -------- | ------------- | ------------ | ------------- |
| Título do herói | 60px | 36px | **2rem**, e **1.5rem** abaixo de 768px |
| Subtítulo | 32px | 24px | **1rem** fixo |
| Logo | 36px | 36px | **1.3rem** |
| Navegação | links 24px | hamburger 55px | o topo alterna navegação e botão de menu em 768px |
| Título do cartão | 40px | 40px | **1.5rem** |
| Rodapé | título à esquerda | título centralizado | o rodapé centraliza abaixo de 768px |

## Checklist (componente novo)

- [ ] Reutilizar tokens e variantes de tipografia já usados em telas similares.
- [ ] Ignorar literal `text-[Npx]` do export do MCP.
- [ ] Só mudar a escala com **decisão explícita** ou para alinhar a outra tela já implementada.
- [ ] Dúvida de API de biblioteca: confirmar no **MCP do Context7**, não de memória.
