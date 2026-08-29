# FateConnect — Web

Front-end do FateConnect em React + Vite.

Estrutura do repositório, fluxo de trabalho, integração contínua e a versão do projeto — que mora no `package.json` da raiz, não neste — estão no [README da raiz](../../README.md).

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

| Comando                       | O que faz                                        |
| ----------------------------- | ------------------------------------------------ |
| `yarn dev`                    | Sobe o servidor de desenvolvimento               |
| `yarn build`                  | Verifica tipos e gera o pacote de produção       |
| `yarn typecheck`              | Só a checagem de tipos                           |
| `yarn lint` / `yarn lint:fix` | Lint (é o gate de estilo de código)              |
| `yarn test`                   | Testes em modo observador                        |
| `yarn test:ci`                | Testes com cobertura — **reprova abaixo de 90%** |

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
scripts/             apoio à automação (recorte de testes por mudança)
```

Dois aliases: `@design-system` para a UI (com `@design-system/icons` para ícones) e `@app` para `src/`.

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

## Automação

| Onde         | O que roda                                          | Cobertura |
| ------------ | --------------------------------------------------- | --------- |
| `pre-commit` | `lint-staged` sobre os arquivos preparados          | —         |
| `pre-push`   | só os testes **relacionados** aos arquivos enviados | —         |
| CI (no PR)   | tipos, lint, **suíte inteira**, build e Sonar        | mede      |

O `pre-push` usa `scripts/test-changed.sh`, que segue o grafo de imports com `vitest related`: mudar uma tela roda os testes que a alcançam, não a suíte inteira. Ele cai na suíte inteira quando a mudança sai de `src/` ou remove arquivo — nesses casos o grafo não alcança o efeito, e `vitest related vite.config.ts` sairia com sucesso sem rodar teste nenhum.

Nenhum dos hooks mede cobertura: o limite é global e medi-lo sobre um recorte reprova código saudável. Quem mede é o CI, sobre a suíte inteira, contra o limite de **90%** que o Vitest aplica dentro do `test:ci` — o mesmo limite vale ao rodar o comando na máquina.

## Estilo

Valor visual novo se justifica contra o que já existe na aplicação — a escala tipográfica, os tokens e as telas vizinhas. Nada de escrever de memória nem de copiar px de export de protótipo. Mudança de aparência se comprova medindo `getComputedStyle` em 1440px e 700px, com a tabela no corpo do PR: captura de tela esconde diferença de poucos pixels.
