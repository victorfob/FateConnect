---
description: Núcleo do front React + Vite em FateConnect/Web — consumo do design system, casca de tela, rotas, dados, gate e os gatilhos para as rules e skills de cada área
paths:
  - "FateConnect/Web/**"
---

# Front — FateConnect/Web

Fora da stack por decisão: SCSS, Tailwind, Nx, biblioteca de máscara e gerenciador de estado global.

## Antes de escrever

- ⛔ Antes de criar arquivo novo (teste, `styles.ts`, `constants/`, `schema/`), abra com `Read` um vizinho do mesmo tipo: o `Write` não carrega a rule com `paths` daquela área.
- Texto que a pessoa lê, novo ou alterado, passa pela skill `ux-writing` antes do commit, com as candidatas ao dono — sem esperar pedido.
- Mudança visual passa pela skill `visual-validation` antes de dizer que está pronta.
- Campo novo em formulário, dado de pessoa que passa a persistir, integração com terceiro (inclui telemetria), dado novo visível a outros ou funcionalidade nova: releia `FateConnect/Web/legal/termos.html` e `privacidade.html` e conserte o que ficou falso ou faltando, no mesmo PR (`legal-documents.md`).
- Medir tamanho de pacote: skill `lighthouse-audit`, referência `bundle-size.md`.

## Consumo do design system

- Ação secundária é `variant="soft"`. No rodapé de diálogo as duas ações são `contained` (`primary` na neutra, `secondary` na que confirma). Falta variante: declare no tema, não componha no ponto de uso.
- ⛔ A altura do botão é a do `size` no tema (`buttonHeightTokens`), igual em toda variante: botão menor é `size="small"`, nunca `height` fixo nem rótulo trocado por `caption` no ponto de uso.
- Diálogo é sempre o `Dialog` do DS: `Dialog.Body`, `Dialog.Footer` e a frase em `Dialog.Message`. ⛔ No desktop sem X (decisão de produto: `Esc` e clique fora dispensam); no estreito, com X.
- Diálogo de formulário monta `Dialog.Form` (envio pela validação da tela), `Dialog.Fields` (grade com folga para o rótulo flutuante; `layout="column"` põe um campo por linha) e `Dialog.Submit` (largura cheia, com `loading`).
- ⛔ O `Dialog.Body` rola e corta o que sai da largura dele: controle com halo (o `Slider`) vai fora do `Dialog.Body`, direto no diálogo.
- Formulário em grade é o `FormGrid` (`FormGrid.Wide` ocupa a linha); cartão com título e ícone é o `SectionCard`. Não escreva outro.
- ⛔ Ação destrutiva usa a variante `destructive` (o `ConfirmAction` a liga com `destructive`). O *Banir* da gestão ainda está neutro: pergunte antes de migrá-lo.
- Barra de ações no estreito: conteúdo centralizado e botões em largura cheia, um sob o outro, a ação principal por último.
- Esconder visualmente sem tirar da acessibilidade é `HiddenField`.
- Tipografia só por variante do tema. `ListItemText`, `MenuItem`, `Chip` e `Alert` aplicam a escala deles se ninguém disser nada: a variante entra por `slotProps` (`slotProps={{ primary: { variant: 'caption' } }}`).
- `palette.text.*` e `contrastText` nunca como fundo.
- Ícone ao lado de outros segue a família deles: preenchido junto de preenchido.
- Linha de largura cheia com um controle na ponta: `FormControlLabel`, com o rótulo ocupando a sobra — a linha inteira é o alvo.

## Tela de módulo

- ⛔ Tela de módulo novo copia a casca da vizinha: `PageShell` com `title` e `PageShell.Back`, filtro no `titleAction`, duas `PageShell.Tab` (lista e cadastro), `CardsList` + `Pagination`. Tela com uma ação só e sem lista é o sinal de que está saindo do padrão.
- Quem chama `usePagedSearch` monta o `PageShell`: o filtro do `titleAction` precisa de `filters` e `applyFilters`. Busca e cabeçalho em componentes diferentes é o sinal.

## Rotas

- Caminhos em pt-BR; a landing é a raiz (`RoutePathEnum.LANDING = '/'`). Trocar segmento quebra link salvo: só com decisão de produto.
- ⛔ Rota aposentada ganha 301 em `deploy/nginx/site.conf.template`, não `<Navigate>` (responde 200 e a URL antiga segue indexada).
- ⛔ Tela com alterações não salvas segura toda saída: navegação pelo `useBlocker`, fechar a aba pelo `useBeforeUnload`, e o *Sair* pelo `LeaveGuardProvider` (a tela registra com `useLeaveInterceptor`). O `useBlocker` não alcança o *Sair*, que troca a árvore sem passar pelo roteador: item de menu novo que sai da conta chama `useSignOut`, nunca `logout` direto. Exemplo: `src/hooks/useLeaveConfirmation.ts`.
- ⛔ Link para a tela aberta é ação morta: some nela (`useMatch`), e o aviso que o leva fica.
- Caronas é uma rota só: ofertar abre diálogo sobre a lista. Não recriar `/caronas/buscar` nem `/caronas/ofertar`.
- Contato é seção da landing (`#contato`, `LandingSectionEnum.CONTACT`), atendida pelo rodapé; não há rota `/contato`. Ao mexer em `constants/navigation.ts` ou nas rotas, não restaurar rota nem item de menu.

## Dados

- URL da API só de `import.meta.env.VITE_*`; caminho em minúsculo (`/rides`, `/lostandfound`), mesmo com o controlador em PascalCase.
- ⛔ Função de serviço nomeia o endpoint, não o recorte que o servidor faz pelo token: `listDenunciations`, não `listMyDenunciations`. Nome com recorte só quando o parâmetro existe (`onlyMine`). Ao mudar contrato, releia quem o chama.

## Gate

⛔ Gate só pelo `yarn` (`yarn lint`, `yarn typecheck`, `yarn test:ci`), de dentro de `FateConnect/Web` depois do `nvm use`: o binário de `node_modules/.bin` roda em qualquer Node e responde verde; só o `yarn` cobra o `engines`. O que o CI roda está em `.github/workflows/check-front.yml`.
