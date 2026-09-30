# Depois do merge

Vale ao mergear um PR ou uma sub-issue, e ao trocar uma decisão com o PR aberto. Nada disto é automático aqui.

## 1. Mergeou = fechar a issue. Não pergunte

⛔ **`Closes #N` não fecha nada neste repo:** o GitHub só o dispara no merge para a branch padrão (`main`), e os PRs miram a `develop`. Feche à mão logo depois do merge; fechar é a última etapa de entregar, não uma decisão a devolver ao usuário.

```bash
gh issue close <n> --comment "Entregue no #<pr>."
```

O card vai para `Done` sozinho: quem move é o `github-project-automation[bot]`, que reage a criar e a fechar issue. As colunas do meio são manuais (`In Progress` ao criar a branch, `In Review` ao abrir o PR). Card em `Done` não prova quem o moveu; a linha do tempo, sim:

```bash
gh api repos/<dono>/<repo>/issues/<n>/timeline --paginate \
  --jq '.[] | select(.event | test("closed|project_v2")) | "\(.event) | \(.actor.login) | \(.created_at)"'
```

⚠️ Issue aberta com PR mergeado nem sempre é esquecimento: o PR pode só depender dela (front citando a issue de backend). Confira o que ela pede antes de fechar.

## 2. Fechou a última sub-issue: feche o pai

⛔ **O relacionamento de sub-issue não propaga o fechamento.** O trabalho acontece nas filhas, ninguém volta ao guarda-chuva, e o pai fica aberto com tudo entregue.

```bash
gh issue close <pai> --comment "As sub-issues foram entregues: #a, #b, #c."
```

A varredura que acha os pais esquecidos:

```bash
gh api graphql -f query='{repository(owner:"<dono>",name:"<repo>"){issues(first:100,states:OPEN){nodes{number title subIssues(first:30){nodes{state}}}}}}' \
  --jq '.data.repository.issues.nodes[] | select((.subIssues.nodes|length)>0 and ([.subIssues.nodes[]|select(.state=="OPEN")]|length)==0) | "#\(.number) \(.title)"'
```

## 3. Cada merge envelhece as irmãs

⛔ **Ao mergear uma sub-issue, releia as irmãs abertas.** A árvore foi escrita com o repositório de um instante, e cada PR invalida um pedaço do que as outras dizem, sem aviso. Procure:

- escopo que outro PR já entregou (vira `[x]` com a nota de onde saiu);
- símbolo que deixou de existir (item morto sai);
- checkbox aberto para decisão que já foi tomada.

⛔ **A decisão revista com o PR aberto envelhece na hora**, sem merge nenhum para lembrar. O tell é reescrever o corpo de um PR aberto: se mudou decisão, e não redação, as issues que a decidiram mudam no mesmo turno.

## 4. Rename envelhece o quadro, não só a árvore

⛔ **O merge que renomeia módulo, entidade ou método envelhece toda issue aberta que o cite**, irmã ou não. Texto velho engana quem lê; instrução velha ("criar a entidade em português") faz nascer código errado.

São dois instrumentos, porque caminho e símbolo se citam de formas diferentes:

```bash
gh issue view <n> --json body -q .body                # o corpo publicado, um por issue aberta
git ls-tree -r --name-only origin/develop             # todo caminho citado tem de casar
git grep -q -w -- "<Símbolo>" origin/develop          # todo símbolo citado tem de existir
```

- Derive o prefixo dos caminhos da própria árvore, não de uma lista à mão.
- Símbolo ausente não é defeito por si: issue não implementada cita o que ainda vai nascer. Procura-se o nome que **existia e mudou**.
