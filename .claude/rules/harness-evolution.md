---
description: 'Evolução contínua do harness deste repo — as regras, skills e memória que guiam o agente vivem em .claude/ e na memória do projeto. Cobre quando uma correção do usuário, uma convenção alterada ou um erro repetido devem virar rule/skill/memória em vez de ficarem só no arquivo em que apareceram. Aplique quando o usuário corrigir um padrão, quando uma convenção mudar, quando o agente repetir o mesmo erro, ou quando o usuário pedir para criar/melhorar rule, skill ou memória.'
---

# Evolução do harness — manter vivo o contexto do agente

A qualidade do trabalho neste repo é a qualidade do que está escrito em `.claude/` e na memória do projeto. Regra não escrita é erro que volta.

## Onde o harness vive

Tudo vive no próprio repositório e é editável direto — não há package nem sync:

| Artefato | Onde | Carrega |
| --- | --- | --- |
| Instruções do projeto | `.claude/CLAUDE.md` | sempre |
| Rules | `.claude/rules/*.md` | sempre (sem `paths`) ou ao ler arquivo que casa (com `paths`) |
| Skills | `.claude/skills/<nome>/SKILL.md` | sob demanda, por `description` ou `/<nome>` |
| Memória do projeto | `~/.claude/projects/-Users-victorbrayner-Development-Projects-FateConnect/memory/` | por recall, indexada em `MEMORY.md` |

`.claude/` é **versionada**: mudar uma rule é mudar o repositório, entra no mesmo PR da mudança que a motivou e passa por review como qualquer código. Duas consequências práticas:

- **A restrição do repositório vale aqui.** Rule e skill são conteúdo público: nada de nome de empregador, repositório interno, pacote privado ou ferramenta corporativa. Quando a orientação vier de fonte interna, registrar só a **decisão e a justificativa autônoma**.
- **A correção anda junto com o código.** Rule que descreve um padrão deve chegar no mesmo PR em que o padrão aparece — separar as duas coisas é como elas divergem.

## Gatilhos — quando escrever em vez de só corrigir

1. **O usuário corrigiu um padrão.** É o gatilho dominante aqui: sem review de terceiro, quase toda regra nasce de uma frase do usuário ("nunca dois componentes no mesmo arquivo", "use `Readonly` nas props"). Corrigir só o arquivo apontado é garantir que o próximo arquivo repita o erro. **A correção entra em rule na mesma rodada.**
2. **Uma convenção mudou.** Estrutura de pastas, barrel, nomenclatura, stack. A rule muda junto com o código, não depois.
3. **Errei o mesmo cenário duas vezes.** A causa costuma ser contexto ausente ou ambíguo, não falta de capacidade. Corrija a rule — e registre na memória **o que o erro custou**, que é o que evita a repetição.
4. **Precisei de workaround.** Se tive que reexplicar o mesmo contexto para chegar no resultado certo, essa explicação é uma rule.
5. **Uma decisão de produto fechou uma porta.** Ex.: a área logada não tem "Entre em Contato". Sem registro, eu "restauro" o item achando que é bug.

## Onde cada coisa mora

Antes de escrever, escolha o lugar — os quatro não são intercambiáveis:

- **`CLAUDE.md`** — fluxo de trabalho, idioma, mapa do repo. Curto: cresce em toda sessão, para sempre.
- **Rule** — o padrão que vale para uma área de código. **Use `paths`.**
- **Skill** — procedimento sob demanda com passos (abrir PR, dividir commits, criar componente). Se a orientação só importa durante uma tarefa específica, é skill, não rule.
- **Memória** — o *porquê* e o que o erro custou. Rule e memória **convivem de propósito** para o mesmo item: a rule diz *meça `getComputedStyle` nos dois apps*; a memória guarda *você mediu a caixa do elemento em vez do glifo e quem viu foi o usuário*. Sem a rule eu não faço; sem a memória eu faço errado com confiança.

## `paths` é o que dispara — a `description` não

- Rule **sem `paths` carrega em toda sessão** e custa contexto permanentemente. Só escreva assim o que vale para o repo inteiro.
- **Escope pelo caminho.** Rule que vale só para o front vai em `FateConnect/Web/**`; rule que vale só para a API, no caminho dela. Sem `paths`, ela passa a custar contexto em toda sessão, inclusive nas que não tocam aquela pasta.
- `description` em rule é documentação para humanos — mantenha precisa, mas não espere que condicione nada. **Só skill dispara por `description`.**
- Esta rule é uma das exceções sem `paths`: os gatilhos disparam em qualquer arquivo.

## Rule também tem fim de vida

Quando a pasta que uma rule descreve deixa de existir, a rule é **deletada, não reescrita** para o que ficou no lugar. Ela descrevia corretamente algo que não existe mais; reaproveitar o arquivo mistura dois contextos e produz orientação híbrida que não vale para nenhum dos dois. O mesmo vale para skill: procedimento sem alvo sai do repo, não vira procedimento genérico.

## Criou skill, rule ou workflow? A lista que o enumera muda no mesmo PR

⛔ **Dois inventários deste repo são mantidos à mão, e um deles mora em dois lugares.** Criar o item sem atualizar a lista não quebra nada e não deixa rastro: meses depois ninguém sabe qual PR a deixou para trás.

| Inventário | Onde é enumerado |
| --- | --- |
| Skills | `.claude/CLAUDE.md` **e** `README.md` — duas cópias, que divergem |
| Workflows | tabela de integração contínua do `README.md` |

**As rules não entram na tabela porque ninguém as enumera** — os dois documentos descrevem o mecanismo (`paths:`, quando carrega) e apontam para um arquivo específico quando precisam. É por isso que elas nunca drifaram. Ao documentar algo novo, prefira descrever o mecanismo a listar os itens: **lista não escrita é lista que não mente.**

**A conferência é contagem, não leitura** — foi lendo e achando certo que ela drifou:

```bash
ls -d .claude/skills/*/ | wc -l      # contra os nomes citados no CLAUDE.md E no README
ls .github/workflows/*.yml | wc -l   # contra as linhas da tabela de CI
```

Em 2026-08-28 o README dizia **4 skills** quando eram 8 e **2 workflows** quando eram 5; o `CLAUDE.md`, que lista as mesmas skills, estava certo — a divergência entre as duas cópias é o sintoma. Junto vieram duas frases envelhecidas do mesmo jeito: *"os dois passos da release"*, que virou três jobs, e *"quem reprova por cobertura é o limite do Vitest"*, depois que o Sonar passou a reprovar também.

⚠️ **O pior caso não é o número errado, é a ausência.** O Sonar não aparecia em lugar nenhum do README, sendo o check obrigatório da `develop` — e ausência não deixa frase errada apontando para ela. Só a comparação com o inventário real a encontra.

## O que NÃO fazer

- **Não duplique silenciosamente.** Antes de criar rule nova, verifique se uma existente deveria ser estendida. Rules sobrepostas diluem o contexto e divergem com o tempo.
- **Não escreva premissa que eu não posso verificar nem executar.** Uma rule diz o que fazer.
  - **Nenhuma seleção de modelo ou agente.** Quem escolhe o modelo é a pessoa; a rule descreve o trabalho.
  - **Nenhum budget de token como justificativa.** Rodar script antes de editar à mão é certo por ser completo e repetível — justifique assim. Agente instruído a economizar token começa a pular etapa.
  - **Nenhuma hedge condicional.** Sem "se disponível" ou "senão use como fallback". Nomeie a ferramenta: `AskUserQuestion` para perguntar, `Grep`/`Glob`/`Read` para inspecionar.
- **Não deixe origem interna vazar do harness para o repo.** O harness é local, mas o que sai dele — código, commit, issue, PR, comentário — é **público**. Quando a orientação vier de fonte interna, registre no repo apenas a **decisão e a justificativa autônoma**, nunca a fonte, o nome do empregador, repositório interno, pacote privado ou ferramenta corporativa.
- **Não abra issue para mudar o harness — mas o PR é obrigatório.** A dispensa é só da issue. Editar `.claude/` é editar o repositório: sai numa branch a partir da `develop` e volta por PR, como qualquer código. ⛔ **Nada vai direto para a `develop`**, nem uma linha de rule. Já commitei rule e skill direto na `develop` achando que "harness não abre PR" me liberava disso; liberava da issue, e só.

## Como escrever

- **Instrução, não prosa.** Forma certa, forma errada, exceção explícita.
- **Prefira a rule curta que sempre dispara à longa que nunca dispara.**
- **Ancore no caso real** que originou a regra ("as etiquetas saíram verde sobre verde no escuro"). O exemplo concreto é o que me faz reconhecer a situação de novo; a formulação abstrata sozinha, não.

## Durante a sessão

Gatilho que dispara no meio de uma tarefa: **termine a tarefa primeiro**, depois traga a proposta — qual gatilho observou, o que escreveria, e em qual dos quatro lugares. Não edite o harness em silêncio como efeito colateral de trabalho não relacionado, e não desvie a tarefa atual para isso.

## Fechamento de rodada

Ao fim de uma rodada com correções do usuário, antes de partir para a próxima tarefa: cruzar **cada** correção contra o harness e terminar em um de dois estados explícitos — **coberta** (dizer por qual rule/skill/memória) ou **descartada por decisão consciente** (dizer o motivo). Auditar também a memória contra as rules: memória órfã é regra que só dispara se eu lembrar de procurá-la.
