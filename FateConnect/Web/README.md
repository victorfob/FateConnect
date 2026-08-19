# FateConnect — Web

Front-end do FateConnect em React + Vite. Substitui gradualmente o front Angular em `FateConnect/Front`, acompanhado pela issue [#47](https://github.com/victorfob/FateConnect/issues/47).

## Requisitos

- **Node** na versão do `.nvmrc` (`nvm use` na pasta resolve)
- **Yarn** 1.x

O projeto **não roda em Node 20**: as ferramentas de teste exigem 22 ou superior.

## Começando

```bash
nvm use
yarn
cp .env.example .env.development   # preencha os endereços do seu ambiente
yarn dev
```

Nenhum endereço de API é versionado — só o `.env.example`, com as chaves vazias.

## Scripts

| Comando | O que faz |
| ------- | --------- |
| `yarn dev` | Sobe o servidor de desenvolvimento |
| `yarn build` | Verifica tipos e gera o pacote de produção |
| `yarn typecheck` | Só a checagem de tipos |
| `yarn lint` / `yarn lint:fix` | Lint (é o gate de estilo de código) |
| `yarn test` | Testes em modo observador |
| `yarn test:ci` | Testes com cobertura — **reprova abaixo de 80%** |

## Estrutura

```
src/
  design-system/     tokens, tema e componentes compartilhados
    tokens/          valores brutos: cor, espaçamento, raio, tipografia, breakpoints
    theme/           paletas clara e escura, overrides do MUI, contraste
    components/      cromo e UI reutilizável (topo, rodapé, menu lateral, seletor de tema)
    index.ts         ponto de entrada público — a aplicação importa só daqui
  pages/             uma pasta por tela
  layouts/           cascas de visitante e de área interna
  components/        composições que conhecem o domínio da aplicação
  services/          cliente HTTP, sessão e serviços de API
  providers/         tema, cache de dados e notificação
  hooks/  utils/     hooks e funções auxiliares
  routes/            caminhos e configuração de rotas
  test/              render de teste com os providers da aplicação
```

## Convenções

O lint aplica as principais; as demais estão nas regras do projeto.

### Design system é a única porta

A aplicação importa UI **somente** de `@design-system` — nunca de `@mui/*`, nunca de um caminho interno do design system. Precisa de um componente que o barrel não expõe? Adicione ao barrel.

### Cor vem da paleta

Os tokens alimentam a paleta em `theme/`; componente lê `theme.palette.*`. Importar token de cor fora do tema **reprova no lint**.

### Estilo em `styles.ts`

Um arquivo por componente, importado como namespace:

```ts
import * as S from './styles';
// <S.PageContainer>
```

`styled(Stack)` quando o elemento for flex, `styled(Box)` no resto — nunca tag HTML crua. A semântica vem da prop `component`:

```tsx
<S.FooterRoot component="footer">
```

> O `Stack` é flex em **coluna** por padrão, enquanto `display: flex` cru é linha. Declare `flexDirection` explicitamente.

### Espaçamento

Tokens em pixels passam pelo helper `spacing()` do design system. **Não** sobrescreva o `spacing` do tema: os componentes do MUI o usam internamente, e alterá-lo encolhe todos eles em silêncio.

## Temas

Claro e escuro, construídos a partir do sistema de cor do Material Design. O seletor fica no topo. As razões de contraste são verificadas por teste em **todos** os pares de conteúdo e fundo, com o mínimo AA (4,5:1) — cor nova sem o par correspondente reprova a suíte.

## Testes

Vitest, Testing Library e MSW. Sempre `screen.*`, consultas por papel de acessibilidade, descrições em inglês no padrão `should …`.

Use o `render` de `@app/test/testing-library`, que já monta tema, rotas e cache — importar `@testing-library/react` direto reprova no lint.

## Paridade visual

Enquanto o front Angular existir, **toda tela migrada precisa provar paridade por medição**: comparar `getComputedStyle` dos elementos equivalentes nos dois apps, em 1440px e 700px, e registrar a tabela no corpo do PR. Captura de tela não conta como prova — ela esconde diferenças de poucos pixels.

Estilo de tela migrada se traduz do arquivo de origem, valor a valor. Nada de escrever de memória.
