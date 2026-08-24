---
description: Padrões do front React + Vite em FateConnect/Web — stack, design system local, estilo, formulários, dados e testes
paths:
  - "FateConnect/Web/**"
---

# React + Vite — FateConnect/Web

Front do FateConnect. Estas regras valem só dentro de `FateConnect/Web`.

## Stack fixada (não introduzir alternativa sem decisão explícita)

| Camada | Escolha |
| ------ | ------- |
| Build | Vite + `@vitejs/plugin-react` |
| UI | MUI + `@mui/icons-material`; estilo com Emotion |
| Datas | `@mui/x-date-pickers` + `date-fns`, locale pt-BR |
| Feedback | `notistack` |
| Rotas | React Router |
| Formulários | `react-hook-form` + `zod` (`@hookform/resolvers`) |
| Dados | `@tanstack/react-query` + `axios` |
| Testes | Vitest + Testing Library |

Fora da stack, por decisão: **sem SCSS**, **sem Tailwind**, **sem Nx**, **sem lib de máscara** e **sem gerenciador de estado global** (não há estado que justifique).

## Design system local

- Tudo em `src/design-system/`: `tokens/` (**não importa MUI**), `theme/`, `ThemeProvider/`, `GlobalStyles`, `components/`.
- A aplicação importa **somente dos barrels `@design-system` e `@design-system/icons`** — nunca caminho interno do design system. É o que mantém barato extrair para pacote depois.
- ⛔ **Nunca sobrescrever o `spacing` do tema.** O MUI chama `theme.spacing(1..3)` dentro dos próprios componentes — gutters do `Toolbar`, padding de `Dialog` e de `Card`. Sobrescrever encolhe todos eles em silêncio: as gutters do `Toolbar` viraram **3px** onde deviam ser 24px. Os tokens em px passam pelo helper `spacing()` do design system; o tema mantém o spacing do MUI. Há teste travando as duas pontas.
- **Tipografia:** variantes declaradas no tema + module augmentation do TypeScript. **Não** criar componente próprio de tipografia — usar o `Typography` do MUI com as variantes do projeto.

## Estilo

- Um `styles.ts` por componente, ao lado do `index.tsx`, com `styled(...)`. Nunca `sx` inline; nunca definir um `styled` no mesmo arquivo que o usa.
- **Importar o arquivo de estilo como namespace:** `import * as S from './styles'`, usando `<S.PageContainer>` no JSX. Deixa evidente no ponto de uso o que é estilo e o que é componente. É a exceção prevista para arquivos de estilo na regra geral de evitar `import * as`.
- Nomear o styled pelo que ele renderiza (`RideCardHeader`, `FilterRow`), nunca genérico (`Wrapper2`, `Box1`).
- Espaçamento, raio e cor sempre por token do `@design-system`. Sem hex ou px solto quando existir token equivalente.

## Estrutura de pasta

Componente = pasta com `index.tsx`, `styles.ts`, `types.ts` (quando houver tipo) e `<Nome>.test.tsx`.

`src/hooks/` guarda **só hooks** — arquivo ali dentro começa com `use` e obedece as regras de hooks. Função pura auxiliar vai para `src/utils/`, mesmo quando só um hook a consome. Feature em `src/pages/<feature>/`; reutilizável em `src/design-system/components/`. Import que sobe **dois níveis ou mais** usa path alias, nunca `../../`: `@app/*` na aplicação e `@src-ds/*` dentro do design system. Um nível (`../`) e o mesmo diretório (`./`) continuam relativos — são curtos e sobrevivem a mover a pasta. O ganho aparece em `styles.ts` de componente: `../../styled` não diz de onde vem, `@src-ds/styled` diz.

## Rotas

Os caminhos são em **pt-BR** — `/inicio`, `/cadastro`, `/menu`, `/achados-perdidos`, `/caronas/buscar`, `/caronas/ofertar`, com `/` → `/inicio` e curinga → `/inicio`. Trocar um segmento quebra link salvo; só com decisão de produto.

## Dados

- `axios` com baseURL de `import.meta.env.VITE_*`. **Nenhuma URL de API literal em arquivo versionado.**
- Interceptor de request injeta o token; interceptor de response centraliza o tratamento de erro.
- Requisição em componente via `@tanstack/react-query` — não `useEffect` + `setState` na mão. Erro de rede vira notificação ao usuário, não só log.

## Formulários

- `react-hook-form` + `zod`; schema junto da feature.
- **Máscara:** função pura (ex.: `toDdMmYyyy`) + hook que a consome. A máscara de data precisa **preservar a posição do cursor** ao editar no meio do campo e ao colar — é requisito, não detalhe.
- Datas via `@mui/x-date-pickers` com `date-fns` no locale pt-BR; formato `dd/MM/yyyy`.

## Testes

- Vitest + Testing Library. Sempre `screen.*` — nunca desestruturar o retorno do `render`.
- **Nomenclatura:** descrição de teste em **inglês**, no padrão `should <do something>` — `it('should redirect the root path to the landing page')`. O `describe` nomeia a unidade sob teste (componente, hook ou função), também em inglês. Identificadores dentro do spec em inglês; **copy de produto em asserção continua em pt-BR**, porque é o texto real que o usuário vê.
- Query por papel de acessibilidade (`getByRole`, `getByLabelText`), não por classe CSS.
- Helper de render com providers em `src/test/testing-library.tsx`.
- **Cobertura mínima de 90%** em statements, branches, functions e lines. O limite está em `vite.config.ts` e é aplicado pelo `yarn test:ci`, que a pipeline executa — código novo sem teste reprova a PR. Exclusões conscientes: `main.tsx` (bootstrap), infraestrutura de teste e declarações de tipo. Ampliar a lista de exclusão exige justificativa; o caminho normal é escrever o teste.
- `renderHook` vem de `@testing-library/react` — **não** do pacote `@testing-library/react-hooks`, que é do React 17 e está morto.

## Figma

Mesma prioridade da regra `.claude/rules/figma-code-typography-divergence.md`: **implementação é fonte de verdade**, Figma é protótipo. A escala tipográfica e os tokens vêm do `@design-system` e das telas já feitas, não dos px do export.
