---
description: Padrões React no front — handlers, efeitos, timers, refs, exports e os idiomas de string que o ESLint deixa passar
paths:
  - "FateConnect/Web/**"
---

# Padrões React

## Estrutura de pasta

Na **raiz** de uma pasta de componente ou tela ficam **apenas três arquivos**: `index`, o teste e `styles`. Todo o resto vai para uma pasta dedicada, nomeada pelo papel:

```
Signup/
  index.tsx
  Signup.test.tsx
  styles.ts
  @types/index.ts          tipos, enums
  constants/index.ts       copy, listas, opções
  schema/index.ts          schema de validação (+ o teste dele ao lado)
  helpers/birthDate.ts     funções puras do domínio da tela
  hooks/useAlgo.ts         hooks da tela
  components/Secao/        subcomponentes
```

O arquivo principal da pasta é `index`, então `import { X } from '../../constants'` continua funcionando depois de `constants.ts` virar `constants/index.ts` — a conversão não mexe nos call sites.

Vale para pasta de componente e de tela. Pastas que **já são** dedicadas por natureza (`src/hooks/`, `src/services/`, `src/utils/`, `design-system/tokens/`) não se aplicam: elas são o destino, não a origem.

## Um componente por arquivo

⛔ **Nunca dois componentes no mesmo arquivo.** Cada componente tem a sua pasta e o seu `index` — inclusive o subcomponente pequeno, usado uma vez só.

- **Interno** (não faz sentido fora do pai): pasta dentro do pai — `ConfirmDialog/DialogMessage/index.tsx`. Quando forem vários, agrupar em `components/`.
- **Reutilizável a partir do design system**: expor por composição — `ConfirmDialog` e `ConfirmDialog.Message` — em vez de um segundo export solto do mesmo arquivo.

⛔ **Constante com JSX no corpo do pai é corpo do pai.** A regra não é sobre a palavra `function` — é sobre onde o JSX mora. As ações do topo montadas como `const actions = (<>…</>)` dentro do `MainLayout` são um componente escondido numa variável, refeita a cada render: virou `HeaderActions`, com pasta e `index`. Se o trecho tem condição, estado ou hook, é componente com pasta — não variável no meio do pai.

## Tipagem e imports

- **`type` por padrão; `interface` só quando herda.** Tipo que estende outro usa `interface X extends Y`, não `type X = Y & {...}`. Na #173 o `RideFilter` nasceu como interseção e virou `interface RideFilter extends PageQuery` — os tipos que ele estende (`PagedResult`, `PageQuery`) seguem `type`, porque não herdam nada.
- ⛔ **`as const` não entra.** Para um conjunto finito de chaves, o que vale é `enum` — é o que `RideTypeFilterEnum` e `LostItemKindFilterEnum` já fazem. Escrevi um objeto `as const` no codec da busca da #173 e ele era o **único** do front inteiro; o ESLint passou nas duas formas, então quem decide é o precedente do repo, não o lint.
- **Props de componente sempre em `Readonly`**: `type RideCardProps = Readonly<{ ride: Ride; onEdit: (ride: Ride) => void }>`. Props não são para mutar.
- **`enum` leva o sufixo `Enum`**: `RideTypeEnum`, `RoutePathEnum`, `GenderValueEnum`. O sufixo separa, na leitura, o que é enum do que é tipo ou componente.
- **O tipo entra no import que já existe.** Se o módulo já é importado por valor, o tipo vai junto com o modificador inline, no fim das chaves — `import { createMemoryRouter, RouterProvider, type LinkProps } from 'react-router'`. Segunda declaração `import type` só quando o módulo entra **apenas** por tipo, como o `ReactNode` num arquivo que não usa nada de valor do React. O lint funde e ordena sozinho.
- **A ordem dos imports é do lint, não da mão.** Pacotes (react na frente, e `@design-system` entre eles) → alias da aplicação → relativos → `.`. O design system conta como **pacote**, não como alias interno: ele mora fora de `src` e é consumido como biblioteca, então fica no bloco do react, sem linha em branco separando. Dentro do bloco relativo: `../` antes de `./`, e o namespace desce para o fim do seu bloco — primeiro o que vem por nome, depois `* as C` e por último `* as S`. `yarn lint:fix` arruma; não vale reordenar à mão contra a regra.
- **Constantes em namespace a partir de três**: com três ou mais nomes vindos de um módulo de constantes, importar `import * as C from './constants'` e usar `C.NOME`, mesmo padrão do `import * as S from './styles'`. Com um ou dois, import nomeado.
- **`import * as S` com alias é sempre erro.** O estilo de um componente mora ao lado do `index` dele, então o import é `'./styles'` e nada mais. `import * as S from '@app/pages/Signup/styles'` em três seções do cadastro queria dizer que a grade do formulário estava na página e as células, que são de cada seção, junto: a página passou a envolver as seções em `FieldGrid` e cada seção ganhou o seu `styles.ts` com as células que usa. Vale também para o `styles.ts` do **pai**: `import * as S from '../styles'` põe o estilo de um componente na pasta de outro. O `FilterPanel` do design system nasceu assim, com a célula do campo desenhada no estilo do painel — a célula é do campo, e foi para a pasta dele.
- **`import * as C` com alias só vale para constante compartilhada.** Constante geral da tela (`FIELD_LABELS`, usada por quatro seções) ou global (`appContact`) pode vir por alias. Constante consumida por **um** componente só vai para a pasta dele — `DELETE_DIALOG` saiu de `pages/Rides/constants` para `RideDeleteConfirmation/constants`. Antes de mover, conte os consumidores: `seatsLabel` parecia exclusivo do `RideCard` e o `RideFormDialog` também o usava.

## Erro de requisição: quem avisa é um só

O `QueryClient` já notifica toda falha, num lugar só. A tela **não** adiciona um `onError` que notifica de novo — sairiam dois alertas para a mesma falha. Cada requisição declara como quer ser avisada:

- Mensagem própria da tela: `meta: { errorMessage: 'Erro ao carregar caronas. Tente novamente.' }`.
- A tela decide pelo status (409, 400, …) e avisa sozinha: `meta: { notifiesErrorItself: true }`, e aí o tratamento global fica calado.
- Nada declarado: sai a mensagem normalizada pelo cliente HTTP.

Vale para `useQuery` e `useMutation`. Um teste que conte `getAllByRole('alert')` protege contra a volta do aviso em dobro.

## Handlers

- Nome com prefixo `handle`: `handleSubmit`, `handleSectionClick`.
- **Sem função anônima em callback JSX.** `onClick={() => doThing(id)}` cria função nova a cada render e quebra memoização; extrair um `handle…` com `useCallback` quando o valor vier de fora.

## Efeitos

- Side effect vive no `useEffect`, nunca no corpo do render.
- **Todo timer e todo listener registrado num efeito precisa de cleanup** no retorno do efeito. Timer sem `clearTimeout` dispara depois do unmount.
- Lista de dependências enxuta: dependência a mais faz o efeito rodar em evento não relacionado.

## Refs e exports

- `useRef` em componente funcional, nunca `createRef`.
- **Apenas exports nomeados** — sem `export default`.

## `let` que guarda estado é estado que o React deveria ter

⛔ **Nada de `let` de módulo guardando estado, nem sinalizador mutável dentro de efeito.** Os dois existem para não usar o que o React oferece, e os dois quebram em silêncio: o de módulo sobrevive entre testes e entre montagens; o de efeito esconde que a limpeza podia não ser necessária.

Aconteceu na #231, os dois no mesmo trabalho:

| O que escrevi | O que era |
| --- | --- |
| `let refused = false` no módulo, com funções para marcar e limpar | `useState` num provider, publicado por contexto |
| `let active = true` no efeito, para não chamar `setState` depois de desmontar | Nada — o provider vive enquanto o app vive, e a proteção guardava contra o que não acontece |

⚠️ **A regra é sobre estado, não sobre a palavra.** `let` local de laço em função pura continua certo — `utils/masks/caret.ts` tem um contador assim, e ele não é estado de ninguém.

## `if` de uma instrução não leva chaves

Corpo com uma instrução só dispensa as chaves. Instrução longa quebra na linha seguinte, indentada — e continua sem chaves:

```tsx
if (useSessionStatus() === SessionStatusEnum.VALID)
  return <Navigate to={RoutePathEnum.MENU} replace />;
```

⚠️ O Prettier mantém essa forma quando a linha estoura a largura; não é ele que reintroduz as chaves.

## Constante de módulo mora no topo

Depois dos imports, num bloco só, junto das que já existem — não encostada na função que a usa. Constante espalhada pelo arquivo esconde que o mesmo número já tinha nome três linhas acima.

⛔ **E nada atravessa o bloco.** Na #173 furei essa regra de dois jeitos no mesmo PR: num arquivo deixei `FIRST_PAGE` e `PAGE_SIZE` lá embaixo, colados na função que os usava; no outro enfiei uma função **no meio** do bloco, partindo-o em dois. O segundo é mais fácil de cometer, porque a função parece pertencer às constantes que acabou de usar — ela vai depois do bloco inteiro.

## Número solto vira nome que explica o significado

O `no-magic-numbers` não abre exceção nem para `0`, `1` e `-1`: eram justamente eles que passavam despercebidos.

⛔ **`ZERO`, `ONE`, `MINUS_ONE` não resolvem** — repetem o valor, que já estava lá. O nome tem de dizer o que aquele número **significa naquele lugar**: `JANUARY`, `SINGLE_PAGE`, `HASH_MARK_LENGTH`, `AFTER_DIGIT`, `ABSENT_CHANNEL`, `NAMES_PER_EDGE`.

Antes de batizar, veja se dá para **remover o número**: `value.length === 0` é `value === ''` quando o valor é texto, e some a contagem.

E se o mesmo número aparece com o mesmo sentido em vários arquivos, ele vira **uma função**, não uma constante repetida — foi o caso do `slice(0, N)` em oito arquivos, que virou `firstCharacters` e `firstItems` em `utils/sequence.ts`.

## Método de string, não expressão regular

⛔ **Padrão literal não vira regex.** `replaceAll('-', '+')` no lugar de `replace(/-/g, '+')`. A versão com string diz o que faz sem ninguém precisar ler regex, e o Sonar reprova a outra (`S7781`).

⛔ **Quantificador colado numa âncora faz backtracking.** `/=+$/` para tirar o preenchimento de um base64 tem custo super-linear (`S8786`) — e `replaceAll('=', '')` resolve igual, porque `=` só aparece no fim.

⛔ **Texto se lê por ponto de código.** `codePointAt` e `fromCodePoint`, nunca `charCodeAt` e `fromCharCode` (`S7758`). `codePointAt` devolve `number | undefined`, então costuma pedir um `?? 0` para o tipo fechar.

As três **reprovam no `yarn lint`**: o `eslint-plugin-sonarjs` traz a `S8786` como `super-linear-regex`, e as outras duas vêm do `eslint-plugin-unicorn` (`prefer-code-point`, `prefer-string-replace-all`), ligadas a dedo na config. Elas chegaram aqui porque o Sonar as pegou primeiro, no PR — hoje o gate local pega antes.

⚠️ **Nem toda regra do Sonar tem plugin ligado.** Achado novo aparecendo no PR sem o `yarn lint` ter reclamado não é para corrigir e seguir: **o README do `eslint-plugin-sonarjs` publica a tabela de mapeamento** de cada regra para o plugin que a implementa. Se a regra estiver lá, ligá-la fecha a classe inteira em vez de um caso.

Aconteceu no PR #203: sete achados de uma vez, todos nas quinze linhas que decodificam o payload do JWT. O efeito colateral de corrigir foi bom — sumiram as quatro expressões regulares do arquivo.

## Byte não é caractere

Ao decodificar base64 com `atob`, o resultado é uma sequência de **bytes**, não texto: `JSON.parse` direto ali corrompe qualquer acento. O caminho é `TextDecoder`.

```ts
const bytes = Uint8Array.from(atob(base64), (character) => character.codePointAt(0) ?? 0);
const json = new TextDecoder().decode(bytes);
```

O teste que protege isso precisa de um nome **com acento** — `João Ávila` passa, `Maria da Silva` não acusaria nada.

## TODO

Comentário `TODO` fora de bloco JSX, referenciando a issue que o resolve.

## Rename em lote não sabe o que é nosso

⛔ **Substituição mecânica atinge chave de contrato que não controlamos.** Antes de trocar um nome em vários arquivos, separe o que é **nosso** do que vem de fora.

Aconteceu na #213, ao levar o cadastro para inglês: o replace `cep` → `zipCode` e `logradouro` → `street` acertou o **stub do ViaCEP**, cujo contrato é do provedor e não muda porque a nossa API mudou. Os testes de preenchimento por CEP quebraram com um erro que não menciona rename — *"Unable to find an element with the display value: Praça da Sé"*.

**Os contratos de terceiro deste repo**, hoje: `services/cep/` (ViaCEP e OpenCEP, com `cep`, `logradouro`, `localidade`, `uf`) e `utils/whatsapp.ts`. A variável que recebe o valor segue as nossas regras de nome; a **chave** copia o provedor exatamente.

⚠️ **O mesmo replace também erra por falta.** Na mesma rodada ele deixou passar `senha:` e `numero:` dentro do payload de um teste, porque a lista de pares não os previa. Errar por excesso e por falta ao mesmo tempo é o normal, não a exceção — por isso a conferência é ler o diff, não confiar na lista.
