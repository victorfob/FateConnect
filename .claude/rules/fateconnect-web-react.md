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

- Tudo em `design-system/`, **irmão de `src`, não dentro dele**: `tokens/` (**não importa MUI**), `theme/`, `ThemeProvider/`, `GlobalStyles`, `components/`. Ele fica fora porque a aplicação o consome como biblioteca — é o mesmo motivo pelo qual o lint o ordena junto dos pacotes, e não junto dos aliases da aplicação.
- A aplicação importa **somente dos barrels `@design-system` e `@design-system/icons`** — nunca caminho interno do design system. É o que mantém barato extrair para pacote depois.
- ⛔ **Nunca sobrescrever o `spacing` do tema.** O MUI chama `theme.spacing(1..3)` dentro dos próprios componentes — gutters do `Toolbar`, padding de `Dialog` e de `Card`. Sobrescrever encolhe todos eles em silêncio: as gutters do `Toolbar` viraram **3px** onde deviam ser 24px. Os tokens em px passam por `theme.space()` e `theme.radius()`, chaves nossas adicionadas ao tema por augmentation; o `theme.spacing` do MUI fica intacto. Há teste travando as duas pontas — ele afirma que `theme.spacing(1)` continua `8px`.
- **Tipografia:** variantes declaradas no tema + module augmentation do TypeScript. **Não** criar componente próprio de tipografia — usar o `Typography` do MUI com as variantes do projeto.

## Estilo

- Um `styles.ts` por componente, ao lado do `index.tsx`, com `styled(...)`. Nunca `sx` inline; nunca definir um `styled` no mesmo arquivo que o usa.
- **Importar o arquivo de estilo como namespace:** `import * as S from './styles'`, usando `<S.PageContainer>` no JSX. Deixa evidente no ponto de uso o que é estilo e o que é componente. É a exceção prevista para arquivos de estilo na regra geral de evitar `import * as`.
- Nomear o styled pelo que ele renderiza (`RideCardHeader`, `FilterRow`), nunca genérico (`Wrapper2`, `Box1`).
- Espaçamento, raio e cor sempre por token do `@design-system`. Sem hex ou px solto quando existir token equivalente.

## Estrutura de pasta

Componente = pasta com `index.tsx`, `styles.ts`, `types.ts` (quando houver tipo) e `<Nome>.test.tsx`.

`src/hooks/` guarda **só hooks** — arquivo ali dentro começa com `use` e obedece as regras de hooks. Função pura auxiliar vai para `src/utils/`, mesmo quando só um hook a consome. Feature em `src/pages/<feature>/`; reutilizável em `design-system/components/`. Import que sobe **dois níveis ou mais** usa path alias, nunca `../../`: `@app/*` na aplicação e `@ds-root/*` dentro do design system. Um nível (`../`) e o mesmo diretório (`./`) continuam relativos — são curtos e sobrevivem a mover a pasta. O ganho aparece em `styles.ts` de componente: `../../styled` não diz de onde vem, `@ds-root/styled` diz.

### Mover pasta: varrer os recortes de config

⛔ **Toda config recortada em `src/**` deixa de alcançar a pasta que sai de `src` — e não acusa erro.** `tsc`, `eslint`, a suíte e o build continuam verdes; só as regras enfraquecem. Ao mover pasta, abrir estes quatro e conferir o glob:

| Arquivo | O que se perde em silêncio |
| --- | --- |
| `eslint.config.js`, bloco de convenções | `no-magic-numbers`, proibição de `sx` inline e de `theme.spacing` |
| `eslint.config.js`, bloco de cor literal | `styles.ts` e `GlobalStyles.tsx` voltam a aceitar hex e `rgba` crus |
| `vite.config.ts`, `coverage.include` | os arquivos saem do denominador, e o limite de 90% passa a medir outra coisa |
| `sonar-project.properties` | a pasta sai da análise, inclusive da regra de 0% de duplicação |

Mais `FateConnect/Web/scripts/test-changed.sh`, cujo `case` decide entre testes relacionados e suíte completa, e o script `format` do `package.json`.

**Cada um se prova com número, porque "passou" não prova nada aqui:** `grep -c '^SF:' coverage/lcov.info` para a cobertura, `files indexed` no log do Sonar comparado com a run anterior, e rodar o hook de verdade no `/bin/bash` com um arquivo da pasta nova.

Não estão em risco o gatilho do CI (`^FateConnect/Web/`) nem os `paths:` das rules (`FateConnect/Web/**`) — o que quebra é sempre o recorte escrito um nível mais fundo. Ancorado no PR #143, que tirou o design system de `src`.

## Rotas

Os caminhos são em **pt-BR** — `/inicio`, `/cadastro`, `/menu`, `/achados-perdidos`, `/caronas`, com `/` → `/inicio` e curinga → `/inicio`. Trocar um segmento quebra link salvo; só com decisão de produto.

Caronas é **uma rota só**: ofertar abre um diálogo sobre a lista. `/caronas/buscar` e `/caronas/ofertar` existiram e foram removidas — não recriar a rota ao mexer em `routeConfig`.

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
