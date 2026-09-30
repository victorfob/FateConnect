---
description: Padrões de código React/TypeScript no front — estrutura de pasta, um componente por arquivo, tipagem, imports, aviso de erro de requisição, ternário, números e rename em lote
paths:
  - "FateConnect/Web/src/**/*.{ts,tsx}"
  - "FateConnect/Web/design-system/**/*.{ts,tsx}"
---

# Padrões React

## Estrutura de pasta

- Na raiz de uma pasta de componente ou tela ficam só `index`, o teste e `styles`. O resto vai para pasta pelo papel, cada uma com `index`: `@types/` (tipos, enums), `constants/`, `schema/`, `helpers/`, `hooks/`, `components/`. Código novo põe tipos em `@types/`; `types.ts` na raiz é legado e se converte quando o PR já toca a pasta.
- ⛔ Arquivo de hook guarda só o hook; função pura que ele usa vai para `src/utils/`. Todo hook mora numa pasta `hooks/`: transversal em `src/hooks/`, de uma tela na `hooks/` dela. O sinal é algo que não é componente nem hook importar do arquivo de um hook.
- Import que sobe dois níveis ou mais usa alias: `@app/*` na aplicação, `@ds-root/*` dentro do design system. `./` e `../` continuam relativos.
- ⛔ Pasta que sai de `src/` ou `design-system/` some em silêncio dos recortes do `eslint.config.js`, do `coverage.include` do `vite.config.ts`, do `sonar-project.properties`, do `FateConnect/Web/scripts/test-changed.sh` e do script `format`: confira cada glob ao mover.

## Um componente por arquivo

- ⛔ Nunca dois componentes no mesmo arquivo, nem o subcomponente de uso único. Interno vai numa pasta dentro do pai (`Dialog/DialogMessage/`), vários em `components/`; reutilizável a partir do DS se expõe por composição (`Dialog.Message`).
- ⛔ Constante com JSX no corpo do pai (`const actions = (<>…</>)`) é componente escondido: com condição, estado ou hook, vira componente com pasta.
- ⛔ Extraiu o miolo e o pai ficou só `return <Filho />`: o pai sai. "Vou precisar dele depois" não segura o arquivo.

## Tipagem e imports

- `type` por padrão; `interface` só quando herda (`interface RideFilter extends PageQuery`).
- ⛔ Sem `as const`: conjunto finito de chaves é `enum` (o lint aceita os dois; o precedente do repo decide).
- Props em `Readonly<…>`. `enum` da aplicação leva sufixo `Enum` (`RideTypeEnum`); tipo público do DS é união de literais.
- ⛔ Import é nomeado. `import * as X` só em duas exceções, as duas da pasta do próprio componente: `import * as S from './styles'` e `import * as C from './constants'`. Estilo ou constante de outra pasta entra por import nomeado (`import { ShellRoot } from '../shell.styles'`). Estilo que outro componente também precisa se promove (ao design system ou a um componente comum), em vez de se importar do `styles.ts` do vizinho.
- Constante consumida por um componente só mora na pasta dele; conte os consumidores antes de mover.
- Só export nomeado. A ordem dos imports é do lint: `yarn lint:fix` arruma.

## Erro de requisição: quem avisa é um só

Requisição em componente via React Query, não `useEffect` + `setState`. O `QueryClient` já notifica toda falha; a tela não soma um `onError` que avisa de novo. Cada `useQuery`/`useMutation` declara:

- mensagem própria: `meta: { errorMessage: '…' }`;
- a tela decide pelo status e avisa sozinha: `meta: { notifiesErrorItself: true }`;
- nada: sai a mensagem normalizada pelo cliente HTTP.

Um teste que conte `getAllByRole('alert')` protege contra o aviso em dobro.

## Forma do código

- Handler com prefixo `handle`, extraído com `useCallback`; sem função anônima em callback JSX.
- ⛔ Sem `let` de módulo guardando estado nem sinalizador mutável dentro de efeito: é `useState`/contexto, ou a proteção não era necessária. `let` local de laço em função pura continua certo.
- ⛔ Recurso criado num `useMemo` e liberado na limpeza de um efeito quebra no `StrictMode`: no dev a limpeza roda antes da segunda montagem e o `useMemo` devolve o recurso já liberado. O padrão está em `useFilePreviewUrl`.
- `if` de uma instrução não leva chaves, mesmo quebrando a linha.
- ⛔ Ternário fora do JSX vira `if` com retorno antecipado ou helper puro (`inputLabelSlot`). No JSX, `cond ? <A /> : null` vira `cond && <A />` — antes, confira se o componente do MUI decide por presença ou por veracidade. Ternário só com dois conteúdos; `attr ? { x } : undefined` costuma ser só `{ x }`, porque atributo indefinido já some.
- Constante de módulo mora num bloco só, logo depois dos imports; nada (nem função) no meio do bloco.
- ⛔ Número com significado vira nome pelo significado (`JANUARY`, `SINGLE_PAGE`), nunca `ZERO`/`ONE`. Antes, veja se dá para remover o número (`value === ''`). Repetido com o mesmo sentido em vários arquivos vira função (`firstCharacters`, `firstItems` em `utils/sequence.ts`).
- Achado do Sonar no PR sem o `yarn lint` ter reclamado: procure a regra no mapeamento do README do `eslint-plugin-sonarjs` e ligue-a no config, em vez de corrigir só o caso.
- Base64 de `atob` é bytes: decodifique com `TextDecoder`, e o teste usa texto com acento.
- `TODO` fora de bloco JSX, citando a issue que o resolve.

## Rename em lote não sabe o que é nosso

- ⛔ Substituição mecânica acerta chave de contrato de terceiro (a chave copia o provedor, como em `utils/whatsapp.ts`) e a nossa própria copy, e traduz a asserção do teste junto — a suíte fica verde. Aplique só em posição de identificador, ou decida uma a uma as ocorrências em string, regex e comentário.
- Depois, releia o diff procurando português com palavra inglesa no meio, e meça na aplicação as telas dos arquivos tocados, não só as que a issue previa.
