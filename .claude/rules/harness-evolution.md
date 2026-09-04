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

`.claude/` é **versionada**: mudar uma rule é mudar o repositório e passa por review como qualquer código. Duas consequências práticas:

- **A restrição do repositório vale aqui.** Rule e skill são conteúdo público: nada de nome de empregador, repositório interno, pacote privado ou ferramenta corporativa. Quando a orientação vier de fonte interna, registrar só a **decisão e a justificativa autônoma**.
- **Onde a mudança de harness entra é decisão de quem revisa — pergunte.** O instinto é mandar rule e código juntos, para não divergirem; mas abrir um PR inteiro por uma frase de rule é cerimônia que não paga, e levar uma rule sem relação nenhuma dentro de um PR de funcionalidade polui o review dele. Com a mudança na mão, ofereça as duas saídas: aproveitar um PR já aberto, ou abrir um só de harness.
- ⛔ **Indo para PR próprio, vai `.claude/` inteiro — não metade.** Em 2026-08-28 escolhi sozinho levar a rule dentro do PR de autenticação; mandado separar, separei só o que não tinha relação com aquele PR e deixei para trás o que ele mesmo havia causado. A correção foi *"falei tudo relacionado a harness num PR proprio"*. **Documentação do repositório não é harness:** `README.md` e `CONTRIBUTING.md` continuam com o código que os motivou.

  ⚠️ **Nem a rule que a própria issue mandou escrever é exceção.** Na #310 o escopo da issue listava a linha nova da `product-copy.md`, e a skill `ux-writing` manda a seção da régua e a copy que se apoia nela saírem no mesmo PR. Usei os dois para manter a rule no PR de código, anunciei a escolha, e a decisão foi *"pode abrir e inclusive levar a regra que ta nesse PR pra ele"*. Escopo de issue e regra de skill não vencem esta: **o critério é o arquivo, não o motivo.**

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

### O gatilho é o **Read**, e trabalhar por Bash desliga todas elas

⛔ **Rule com `paths` carrega quando um arquivo que casa é lido pela ferramenta `Read`.** `cat`, `sed`, `grep`, `head` e heredoc de python leem o mesmo arquivo e **não** disparam nada: o conteúdo entra na conversa, a rule não.

Aconteceu em 02/09/2026, nas #255, #253 e #254. Escrevi C# para três PRs de API inspecionando tudo por Bash — e as **cinco** rules de `FateConnect/FateConnect.Api/**` ficaram fora de contexto a sessão inteira: `dotnet-migrations`, `dotnet-testing`, `dotnet-code-style`, `dotnet-code-quality` e `dotnet-authorization`.

O custo, medido depois:

| O que eu fiz sem a rule | O que a rule já dizia |
| --- | --- |
| Amostrei dois arquivos para inferir se o `/// <inheritdoc />` gerado sai da migration, e generalizei errado | `dotnet-migrations.md` diz exatamente quais saem e quais ficam |
| Medi cobertura parseando OpenCover à mão, e só depois de ser cobrado | `./scripts/coverage-changed.sh` existe para isso, e a rule manda rodá-lo **antes** de dizer que acabou |
| Escrevi três testes de borda sobre `DateTime.UtcNow` | "enquanto a costura não existir, **não escreva o teste que depende do relógio**" |

⚠️ **A tentação é escrever uma rule sem `paths` para garantir que ela carregue.** Não é a saída: sem `paths` ela custa contexto em toda sessão, inclusive nas que não tocam a pasta — o problema é o meu gesto, não o escopo dela.

**O que fazer, antes de escrever a primeira linha numa área:** abrir **um** arquivo daquela pasta com o `Read`, ou ler as rules dela diretamente. Um `Read` num arquivo qualquer de `FateConnect/FateConnect.Api/` traz as cinco de uma vez.

```bash
ls .claude/rules/            # e ler as que casam com a área da tarefa
```

⛔ **O sinal de risco é o modo Bash-primeiro.** Ele é pedido de propósito para economizar ferramenta, e o efeito colateral é silencioso: nada avisa que uma rule não carregou. Área nova na sessão ⇒ um `Read` de propósito, mesmo que eu já tenha o arquivo na tela.

## Caminho citado no harness tem check

Rule e skill citam código por caminho, e nada as avisa quando o código sai — o texto continua sintaticamente perfeito descrevendo algo que não existe.

```bash
./scripts/check-harness-paths.sh
```

Ele lista todo caminho ancorado numa entrada real da raiz do repositório que não corresponde a arquivo nem diretório rastreado. Rodando contra o harness de antes da limpeza do #186, encontrou os quatro que uma leitura à mão tinha encontrado — inclusive um dentro de bloco de código e um sem extensão, que uma varredura por crase perde.

⚠️ **Ele cobre caminho, não nome de símbolo.** O XML doc do `TimeOnlyJsonConverter` foi citado por nome numa skill e sobreviveu à remoção sem o check acusar. Para símbolo, o `grep -rn "<Nome>" .claude/` da `comments.md` continua sendo o que existe.

⚠️ **A resposta é relativa à branch.** Caminho que nasce noutro PR aparece como órfão até aquele PR mergear — é correto, não defeito.

## Rule também tem fim de vida

Quando a pasta que uma rule descreve deixa de existir, a rule é **deletada, não reescrita** para o que ficou no lugar. Ela descrevia corretamente algo que não existe mais; reaproveitar o arquivo mistura dois contextos e produz orientação híbrida que não vale para nenhum dos dois. O mesmo vale para skill: procedimento sem alvo sai do repo, não vira procedimento genérico.

## Rule descreve o estado atual, não o caminho até ele

⛔ **Não registre em rule o que foi removido, renomeado ou dissolvido.** A rule é lida por quem vai escrever código agora, e ela responde *o que existe*. O histórico já está no GitHub — commit, PR e issue —, e é lá que se pergunta por que algo deixou de existir.

Cobrado em 2026-08-29, na `fateconnect-overview.md`: eu tinha escrito *"O microsserviço de caronas foi dissolvido aqui pela #44"* e ainda **defendi** a frase, como proteção contra alguém "restaurar" o que saiu. A correção foi direta: *"ela deve dizer o estado atual da aplicação, se alguém quiser ver histórico é só ver o github"*.

**O teste:** a frase descreve algo que **existe**? Fica. Descreve algo que **existia**? Sai. E o que sobra costuma dizer a mesma coisa sem envelhecer — *"uma só, em módulos por domínio"* já entrega tudo o que *"o microsserviço foi dissolvido"* entregava.

⚠️ **Não confunda com a proibição ancorada no presente.** *"Não existe tela de contato… não 'restaurar' o item de menu"* é estado atual mais consequência, e impede uma mudança errada hoje. O que sai é a **narrativa do passado**, não a instrução.

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
- **Código de fonte interna é referência de comportamento, nunca origem de código.** Apontado um componente interno como base, leia-o para entender **o que ele faz** — estados, entradas, o que a interação precisa cobrir — e escreva o nosso. Não copie trecho, e não cite a origem em lugar nenhum do repo: nem na issue, nem no commit, nem no comentário. Aconteceu em 31/08/2026, ao especificar o campo de intervalo de datas: a leitura deu os requisitos e a implementação nasce aqui.
- **Não abra issue para mudar o harness — mas o PR é obrigatório.** A dispensa é só da issue. Editar `.claude/` é editar o repositório: sai numa branch a partir da `develop` e volta por PR, como qualquer código. ⛔ **Nada vai direto para a `develop`**, nem uma linha de rule. Já commitei rule e skill direto na `develop` achando que "harness não abre PR" me liberava disso; liberava da issue, e só.

## Como escrever

- **Instrução, não prosa.** Forma certa, forma errada, exceção explícita.
- **Prefira a rule curta que sempre dispara à longa que nunca dispara.**
- **Ancore no caso real** que originou a regra ("as etiquetas saíram verde sobre verde no escuro"). O exemplo concreto é o que me faz reconhecer a situação de novo; a formulação abstrata sozinha, não.

## Durante a sessão

Gatilho que dispara no meio de uma tarefa: **termine a tarefa primeiro**, depois traga a proposta — qual gatilho observou, o que escreveria, e em qual dos quatro lugares. Não edite o harness em silêncio como efeito colateral de trabalho não relacionado, e não desvie a tarefa atual para isso.

## Fechamento de rodada

Ao fim de uma rodada com correções do usuário, antes de partir para a próxima tarefa: cruzar **cada** correção contra o harness e terminar em um de dois estados explícitos — **coberta** (dizer por qual rule/skill/memória) ou **descartada por decisão consciente** (dizer o motivo). Auditar também a memória contra as rules: memória órfã é regra que só dispara se eu lembrar de procurá-la.

⛔ **A varredura roda ANTES de abrir o PR de harness, não depois.** É o único momento em que o item que ela encontra entra de graça: com o PR aberto, ele custa outro PR; com o PR mergeado, ele fica esperando o próximo — e "o próximo" é onde item conversado evapora.

Aconteceu em 2026-08-28. Saíram **dois** PRs de harness no mesmo dia e um item conhecido não entrou em nenhum: o Victor tinha corrigido, horas antes do primeiro, que suposição com ele presente deveria virar pergunta. Eu só cruzei as correções contra o harness depois do segundo PR mergear, e a cobrança foi direta — *"acabamos de fazer um PR de harness, pq vc não sugeriu colocar nele isso?"*.

**O gatilho é escrever `gh pr create` num PR que toca `.claude/`.** Antes de rodar: releia a conversa inteira procurando correção do usuário, não só a que motivou este PR.