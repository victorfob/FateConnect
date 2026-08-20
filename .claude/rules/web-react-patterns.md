---
description: Padrões React no front — handlers, efeitos, timers, refs e exports
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

## Tipagem e imports

- **Props de componente sempre em `Readonly`**: `type RideCardProps = Readonly<{ ride: Ride; onEdit: (ride: Ride) => void }>`. Props não são para mutar.
- **`enum` leva o sufixo `Enum`**: `RideTypeEnum`, `RoutePathEnum`, `GenderValueEnum`. O sufixo separa, na leitura, o que é enum do que é tipo ou componente.
- **Constantes em namespace a partir de três**: com três ou mais nomes vindos de um módulo de constantes, importar `import * as C from './constants'` e usar `C.NOME`, mesmo padrão do `import * as S from './styles'`. Com um ou dois, import nomeado.

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

## TODO

Comentário `TODO` fora de bloco JSX, referenciando a issue que o resolve.
