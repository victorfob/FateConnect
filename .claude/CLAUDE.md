# FateConnect — instruções do projeto

## Restrição do repositório (obrigatória)

Este é um repositório **público** de trabalho acadêmico. **Nenhum conteúdo do repo** — issues, PRs, commits, código, comentários ou documentação — deve conter menção, nome ou referência a empregador, repositórios internos, pacotes privados ou ferramentas corporativas. Quando uma referência técnica vier de fonte interna, escrever no repo apenas a **decisão e a justificativa autônoma**.

Planejamento e rastreio ficam no **GitHub** (issues + Project board do repositório). Não publicar nada em ferramentas de gestão de empresa.

## Idioma

- Interface, URLs e copy de produto: **pt-BR**.
- **Fluxo git:** mensagem de commit, nome de branch e **título** de PR em **inglês**; a **descrição** do PR é o único texto do fluxo em pt-BR.
- Issues do GitHub: **pt-BR** (documento de planejamento lido pelo time).
- Código e estrutura (identificadores, arquivos, pastas): **inglês**.
- Detalhe completo na regra de locale (carrega ao trabalhar no front).

## Organização desta configuração

- `.claude/rules/` — regras do projeto. Sem `paths:` carregam sempre; com `paths:` carregam quando um arquivo que casa é lido.
- `.claude/skills/` — fluxos sob demanda: `spec-issue` (especificar uma issue e dividir em sub-issues), `pr-creator` (abrir/atualizar PR), `write-commit` (mensagem de commit e agrupamento em commits), `changelog-writer` (entrada do CHANGELOG) e `fateconnect-create-component` (criar componente no front).
- `.claude/` é **versionada**: rule e skill passam por review no PR como qualquer código, e valem igual para quem clonar o repo. Por isso a restrição do repositório acima se aplica a elas também.

## Fluxo de trabalho

- Branch base: **`develop`**. ⛔ **Nunca commitar direto nela** — toda mudança sai numa branch a partir da `develop` e volta por PR, **inclusive mudança em `.claude/`**. Nomear branch como `<tipo>/<número-da-issue>` (ex.: `chore/48`); quando não houver issue, um slug descritivo (`docs/spec-issue-skill`).
- Toda correção ou alteração começa por uma **issue no GitHub** — o número dela alimenta a branch, o título do PR e o corpo do PR.
- Abrir PR: usar a skill `pr-creator`. Commitar: usar a skill `write-commit` — e **pedir confirmação antes de qualquer comando git**.
- ⛔ **Nunca escrever changelog à mão** — usar a skill `changelog-writer`. À mão sai um bullet por commit, que é o oposto do formato: uma entrada principal descrevendo o efeito para quem usa. O formato está em `.claude/rules/changelog-format.md`.
- ⛔ **Não criar artefato de processo por conta própria** — issue, branch, PR, label, milestone. A regra "toda alteração começa por uma issue" vale para o que o usuário tratou como **tarefa**, não para todo ajuste solto. Pedido pequeno e avulso ("adiciona o codeowner pra mim") entra na tarefa em andamento ou na próxima, em **commit separado**. Na dúvida, perguntar: uma pergunta custa menos que fechar issue, branch e PR depois.

## Comandos

Front (`FateConnect/Web`, Node do `.nvmrc` + Yarn 1.x):

```bash
cd FateConnect/Web && nvm use && yarn && yarn dev
cd FateConnect/Web && yarn test:ci      # suíte inteira com cobertura
cd FateConnect/Web && yarn lint && yarn typecheck
```

```bash
git config core.hooksPath .githooks     # habilita os hooks deste clone
```

O `pre-push` roda só os testes **relacionados** aos arquivos enviados (via `Web/scripts/test-changed.sh`); a suíte inteira com cobertura fica no CI.

## Stack do front

- Vite, React, MUI + Emotion, `@mui/x-date-pickers` + `date-fns`, notistack, React Router, react-hook-form + zod, TanStack Query, axios, Vitest + Testing Library.
- Design system local em `Web/design-system/` — **fora de `src`**, porque a aplicação o consome como biblioteca. Dois barrels públicos: `@design-system` (componentes, estilo, tokens) e `@design-system/icons`. A aplicação usa também o alias `@app` para `Web/src`.
- Padrões em `.claude/rules/fateconnect-web-react.md` e nas regras `web-*`.

### Uma armadilha já mapeada

O `spacing` default do MUI é **multiplicador de 8px**. Com escala de tokens em px, sem o override px→rem o layout fica 8x errado silenciosamente — é o que os helpers `spacing()` e `radius()` do design system resolvem, e por isso o `theme.spacing` do MUI não é sobrescrito.
