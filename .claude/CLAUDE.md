# FateConnect — instruções do projeto

## Restrição do repositório (obrigatória)

Este é um repositório **público** de trabalho acadêmico. **Nenhum conteúdo do repo** — issues, PRs, commits, código, comentários ou documentação — deve conter menção, nome ou referência a empregador, repositórios internos, pacotes privados ou ferramentas corporativas. Quando uma referência técnica vier de fonte interna, escrever no repo apenas a **decisão e a justificativa autônoma**.

- Código de fonte interna é referência de comportamento, nunca origem: leia para entender o que ele faz, escreva o nosso, e não cite a origem em issue, commit ou comentário.
- Planejamento e rastreio ficam no **GitHub** (issues + Project board do repositório). Não publicar nada em ferramentas de gestão de empresa.

## Mapa do repositório

- **Front:** `FateConnect/Web` — React + Vite, MUI + Emotion. Design system local em `Web/design-system/`, fora de `src`, com os barrels `@design-system` e `@design-system/icons`; alias `@app` para `Web/src`. Padrões em `fateconnect-web-react.md` e nas rules `web-*`.
- **API (.NET 8):** `FateConnect/FateConnect.Api`, uma só, em módulos por domínio (`Auth`, `Common`, `Denunciations`, `LostAndFound`, `Rides`, `Users`). Os testes ficam em `FateConnect/FateConnect.Api.Tests`, pasta irmã.

## Idioma

- Interface, URLs e copy de produto: **pt-BR**.
- Conversa com quem pede, perguntas e tabelas incluídas: **pt-BR**.
- **Fluxo git:** mensagem de commit, nome de branch e **título** de PR em **inglês**; a **descrição** do PR é o único texto do fluxo em pt-BR.
- Issues do GitHub: **pt-BR**.
- Código e estrutura (identificadores, arquivos, pastas): **inglês**.

## Harness (`.claude/`)

- `.claude/` é **versionada**: rule e skill passam por review como código e valem igual para quem clonar o repo; a restrição acima vale para elas.
- Rule sem `paths` carrega sempre; com `paths`, quando o **`Read`** abre um arquivo que casa — `cat`, `grep` e `sed` não disparam nada. ⛔ Área nova na sessão ⇒ um `Read` de propósito num arquivo dela antes de editar.
- Skills carregam pela `description` ou por `/<nome>`: `spec-issue`, `pr-creator`, `resolve-pr-comments`, `write-review-comment`, `write-commit`, `changelog-writer`, `create-release`, `lighthouse-audit`, `ux-writing`, `fateconnect-create-component`, `harness-evolution`, `parallel-work`, `prove-the-mechanism` e `visual-validation`.
- Correção de padrão feita pelo usuário vira rule ou skill: termine a tarefa e proponha (skill `harness-evolution`, que tem a escada de destino e o orçamento de contexto).

## Fluxo de trabalho

- Branch base: **`develop`**. ⛔ **Nunca commitar direto nela** — toda mudança sai numa branch a partir da `develop` e volta por PR, **inclusive mudança em `.claude/`**.
- Nome de branch: `<tipo>/<número-da-issue>`, com o tipo do Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`) — ex. `feat/118`. Sem issue, `<tipo>/<slug-em-inglês>` (`docs/spec-issue-skill`).
- ⛔ Branch criada de `origin/develop` nasce rastreando a `develop`, e o `git push` vai para ela: rode `git branch --unset-upstream <nova>` logo depois de criar.
- Toda correção ou alteração começa por uma **issue no GitHub** — o número dela alimenta a branch, o título do PR e o corpo do PR.
- Criar ou especificar issue: skill `spec-issue`. Abrir PR: skill `pr-creator`. Commitar: skill `write-commit` — e **pedir confirmação antes de qualquer comando git**. ⚠️ **A confirmação vale para o fluxo que ela nomeia:** autorizado *"segue até abrir o PR"*, commit, reescrita, push e resposta em thread até ali não se perguntam de novo. Volta a ele só a decisão nova, que ele não previu.
- ⛔ **Nunca escrever changelog à mão** — usar a skill `changelog-writer`. À mão sai um bullet por commit, o oposto do formato: uma entrada principal com o efeito para quem usa.
- ⛔ **Não criar artefato de processo por conta própria** — issue, branch, PR, label, milestone. "Toda alteração começa por uma issue" vale para o que o usuário tratou como **tarefa**; pedido pequeno e avulso entra na tarefa em andamento ou na próxima, em **commit separado**. Na dúvida, perguntar: uma pergunta custa menos que fechar issue, branch e PR depois.
- ⛔ Paralelizar é por issue, nunca por fatia de issue, e quem decide é o usuário: proponha a fatiação e espere o ok; aprovada, todas as frentes saem no mesmo turno (skill `parallel-work`).

## Comandos

Front (`FateConnect/Web`, Node do `.nvmrc` + Yarn 4 pelo Corepack, com `corepack enable` uma vez por máquina):

```bash
cd FateConnect/Web && nvm use && yarn && yarn dev
git diff --name-only origin/develop... | xargs FateConnect/Web/scripts/test-changed.sh   # testes que a mudança alcança
cd FateConnect/Web && yarn lint && yarn typecheck
```

⛔ A suíte inteira do front (`yarn test:ci`) é do CI: rodada aqui ela trava a máquina, com qualquer número de workers.

API (.NET 8):

```bash
dotnet test FateConnect/FateConnect.Api/FateConnect.Api.sln
```

```bash
git config core.hooksPath .githooks     # habilita os hooks deste clone
```

Os hooks usam o Node do `.nvmrc` e reprovam sem ele. O `pre-commit` roda o lint-staged no front e compila a API; o `pre-push` roda os testes relacionados aos arquivos enviados e a suíte da API; a suíte inteira com cobertura roda no CI.
