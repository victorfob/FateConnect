---
name: harness-evolution
description: "Evolui o harness deste repo (.claude/rules, .claude/skills, CLAUDE.md, memória do projeto). Use quando o usuário corrigir um padrão, uma convenção mudar, o mesmo erro se repetir, for preciso reexplicar contexto, uma decisão de produto fechar um caminho, o usuário pedir para criar, corrigir, enxugar ou remover rule ou skill, ao apagar ou renomear símbolo citado no harness, ao registrar no harness uma lição da tarefa, ou antes de gh pr create num PR que toca .claude/. Cobre o orçamento de contexto, onde cada coisa mora, custo de paths, como escrever, fim de vida de rule e a varredura de fechamento."
---

# Evolução do harness

## Paradas

1. ⛔ **Gatilho no meio de outra tarefa → termine a tarefa e só então proponha** qual gatilho viu, o que escreveria e em qual lugar. Não edite o harness em silêncio como efeito colateral, nem desvie a tarefa atual para isso.
2. ⛔ **Onde a mudança de harness entra é decisão de quem revisa → ofereça as duas saídas** (PR já aberto ou PR só de harness) e espere. Indo para PR próprio, vai `.claude/` inteiro: o critério é o arquivo — escopo de issue ou regra de outra skill não vencem. `README.md` e `CONTRIBUTING.md` ficam com o código que os motivou.
3. ⛔ **Antes de `gh pr create` num PR que toca `.claude/` → releia a conversa inteira** e cruze cada correção do usuário com o harness: coberta (por qual rule, skill ou memória) ou descartada (por qual motivo). Com o PR aberto o item custa outro PR; mergeado, ele evapora.
4. Nada vai direto para a `develop`, nem uma linha de rule (`CLAUDE.md`). Harness dispensa a issue, não o PR.
5. ⛔ **A mudança faz crescer o que carrega em toda sessão (`CLAUDE.md`, rule sem `paths`, `description` de skill) → meça antes e depois** com `./scripts/harness-budget.sh` e ponha os dois números e o motivo no corpo do PR. Sem o número, desça um degrau na escada de destino.

## Onde o harness vive

| Artefato | Onde | Carrega |
| --- | --- | --- |
| Instruções do projeto | `.claude/CLAUDE.md` | sempre |
| Rules | `.claude/rules/*.md` | sempre (sem `paths`) ou no `Read` de arquivo que casa (com `paths`) |
| Skills | `.claude/skills/<nome>/SKILL.md` e `references/` | a `description` sempre; o corpo quando invocada |
| Memória | a memória do projeto do Claude Code, fora do repositório | por recall, indexada em `MEMORY.md` |

`.claude/` é versionada e pública: vale a restrição do repositório do `CLAUDE.md`.

## Gatilhos — escrever em vez de só corrigir

1. **O usuário corrigiu um padrão.** Corrigir só o arquivo apontado garante que o próximo repita o erro: a correção entra em rule ou skill na mesma rodada.
2. **Uma convenção mudou** (pasta, barrel, nome, stack): a rule muda junto com o código.
3. **O mesmo cenário errou duas vezes:** falta contexto. Corrija a rule e registre na memória o que o erro custou.
4. **Precisei reexplicar o mesmo contexto:** essa explicação é uma rule.
5. **Uma decisão de produto fechou uma porta** (não há tela de contato): sem registro, alguém "restaura" o item achando que é bug.

## Orçamento de contexto

O harness custa contexto em toda tarefa, e cada lição nova soma. O teto de referência é o que o repo carrega hoje: **~4 mil tokens numa sessão que ainda não abriu arquivo e ~10 mil numa tarefa típica de uma área** (tela do front, endpoint da API). Meça a tarefa que a lição atinge:

```bash
./scripts/harness-budget.sh                                    # só o que carrega sempre
./scripts/harness-budget.sh <arquivos que a tarefa típica abre>  # sempre + rules cujo paths casa
```

Passar do teto não é proibido, mas pede o motivo no PR e, de preferência, uma poda que o compense.

## Onde cada coisa mora: a escada de destino

Suba só quando o degrau de baixo não resolve. O primeiro é o mais barato:

1. **Gate** — lint, hook ou CI que reprova o erro. Pega sempre, e a rule que o repetiria não se escreve.
2. **`references/` de uma skill existente** — caso, receita ou medição que só importa quando a skill roda.
3. **Corpo de uma skill existente** — passo de um procedimento (abrir PR, dividir commits, validar tela).
4. **Linha numa rule existente cujo `paths` já casa** — padrão de uma área de código. Estender vence criar.
5. **Rule nova, com o `paths` mais estreito que cobre o erro.**
6. **Skill nova** — procedimento de um momento só que nenhuma skill cobre; a `description` leva só os gatilhos.
7. **`CLAUDE.md` ou rule sem `paths`** — só o que vale em qualquer arquivo e acontece sem nenhuma skill invocada (fluxo git, idioma, conduta). Parada 5.

A **memória** do projeto guarda o porquê e o que o erro custou, fora do repositório: a rule diz o que fazer, a memória impede fazer errado com confiança.

## Custo: `paths` é o que dispara

- Rule sem `paths` carrega em toda sessão. Só assim o que vale para o repo inteiro, em qualquer arquivo.
- **Escope pelo caminho mais estreito que cobre o erro:** regra de migration na pasta de migrations, regra de teste nos arquivos de teste, regra de nginx em `deploy/**`.
- `description` de rule é documentação para humanos; só skill dispara por `description`.
- ⚠️ A tentação de tirar o `paths` para garantir que a rule carregue é errada: o defeito é ler por Bash, não o escopo. O `Read` de propósito resolve (`CLAUDE.md`).

## Como escrever

- **Instrução, não prosa.** Forma certa, forma errada, exceção explícita. Bullets de 1–2 linhas; par ❌/✅ só onde a forma errada não é óbvia.
- ⛔ **A lição entra compactada:** a regra e meia linha de motivo, no presente. Data, "decidido por", "aconteceu no #N", a citação do pedido e a medida que muda (largura em px, contagem) vão para o corpo do PR, não para o arquivo.
- **Somar é também podar:** ao estender uma rule, releia a seção vizinha e tire o que envelheceu ou que o gate passou a pegar.
- **Rule só por cicatriz:** fica o erro que aconteceu e que o modelo não evitaria sozinho. Conhecimento genérico sai.
- **Ancore no caso concreto, no presente** ("as etiquetas saíram verde sobre verde no escuro"). O exemplo faz reconhecer a situação; a data, a issue e a conta ficam no PR.
- Proteção que briga com o pedido do usuário ("pergunte antes", "nunca X") vira parada no topo da skill: gatilho + ação + motivo. Compactar não enfraquece proteção.
- ⛔ **Não duplique.** Antes de criar, veja se uma rule, skill ou o `CLAUDE.md` já cobre; estenda em vez de repetir.
- **O que o lint, o typecheck ou o CI reprovam não vira rule** — o gate já pega. Fato de config volátil (threshold, estado de regra) também não: escreva o método ("leia o workflow X").
- **Nada que não se possa verificar nem executar:** sem seleção de modelo, sem "para economizar tokens" como motivo escrito na rule, sem hedge ("se disponível"). Nomeie a ferramenta: `AskUserQuestion` para perguntar, `Grep`/`Glob`/`Read` para inspecionar.
- Nada da máquina de quem escreve: caminho local, nome de usuário, wrapper de shell pessoal.

## Rule descreve o estado atual

⛔ Não registre o que foi removido, renomeado ou dissolvido: o histórico está no GitHub. **Teste:** a frase descreve algo que existe? Fica. Algo que existia? Sai. *"Uma só, em módulos por domínio"* diz o mesmo que *"o microsserviço foi dissolvido"* sem envelhecer.

⚠️ Proibição ancorada no presente fica: *"não existe tela de contato; não restaurar a rota"* impede uma mudança errada hoje.

## Fato citado se confere

- **Caminho:** `./scripts/check-harness-paths.sh` lista o caminho citado em `.claude/` que não existe mais. A resposta é relativa à branch: caminho que nasce noutro PR aparece órfão até ele mergear.
- **Símbolo:** o check não cobre nome. Ao apagar ou renomear declaração, procure o nome no harness: `grep -rn "<Nome>" .claude/`.
- Antes de manter uma afirmação sobre código, `git grep` pelo token nu.

## Rule também tem fim de vida

Pasta que a rule descreve deixou de existir ⇒ a rule é **deletada**, não reescrita para o que ficou no lugar. Idem skill sem alvo.

## Inventário

Criou ou removeu skill ou workflow → atualize o `README.md` (lista de skills e tabela de CI) e a lista de skills do `CLAUDE.md` no mesmo PR. Confira por contagem, não por leitura:

```bash
ls -d .claude/skills/*/ | wc -l
ls .github/workflows/*.yml | wc -l
```

Rules não se enumeram: descreva o mecanismo (`paths`), não a lista.

## Fechamento de rodada

Ao fim de uma rodada com correções do usuário, cruze **cada** correção contra o harness e termine em um de dois estados explícitos: **coberta** (por qual rule, skill ou memória) ou **descartada** (com o motivo). Audite também a memória contra as rules: memória órfã só dispara se alguém lembrar de procurá-la. A varredura roda antes do PR (parada 3).

Memória que declara estado concluído ("nada pendente", "os dois ambientes estão iguais") envelhece calada: grave a medição datada e, ao lado, o comando que responde hoje.
