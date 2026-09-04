---
description: Risco residual não é entregável — evidência estatística é gatilho de procurar o mecanismo, e o zero de uma sonda só vale com controle positivo
---

# Prove o mecanismo, não a frequência

⛔ **Evidência estatística não é resultado para relatar — é ordem de ir atrás do mecanismo.** "Rodei 5 vezes e passou" responde *com que frequência*; a pergunta era *pode acontecer*. Só a segunda fecha o assunto.

**O gatilho é a frase que você está prestes a escrever:** *"é evidência, não prova"*, *"rodei N vezes e passou"*, *"aqui não reproduz"*, *"deve ser raro"*. Nenhuma é conclusão. Todas são o momento de responder duas coisas:

1. **Qual é a pré-condição exata da falha que eu temo?** Ela costuma estar escrita na mensagem de erro dela.
2. **Essa pré-condição chega a existir aqui — medido, não deduzido?**

Provada a impossibilidade, o risco acabou e o número vira nota de rodapé. Não provada, o resíduo é real e relatá-lo é o certo — dizendo **o que já foi descartado** e o que resolveria.

⛔ Aconteceu na #237. Fechei a entrega listando um risco em aberto — 24 fábricas de teste criando banco ao mesmo tempo, *"5 corridas verdes, é evidência, não prova"* — e pedi confirmação para commitar. A devolução do Victor foi *"ué se é risco oq podemos fazer pra não ter risco?"*. Não havia risco, e o mecanismo levou três minutos: a falha temida exige sessão aberta no `template1`, e o `template1` recebe **zero** conexões na corrida real. Pergunta categórica tratada como estatística.

⚠️ **A ressalva honesta é o disfarce.** *"É evidência, não prova"* soa como rigor — soa melhor que "não consigo explicar" —, e é justamente por isso que a parada passa despercebida. O teste não é se a frase é verdadeira: é se ela **transfere a dúvida** para quem lê.

## O zero só vale com controle positivo

⛔ **Antes de relatar que a falha não aconteceu, force-a a acontecer.** Sonda incapaz de produzir o defeito de propósito não mede a ausência dele — mede nada, e devolve verde.

Duas na mesma #237: `DOCKER_HOST` apontando para porta morta não desligou o Docker, porque o Testcontainers cai para o socket do Desktop e a suíte passa igual; e a guarda que eu escrevi para o caso "sem Docker" **nunca era exibida**, porque a exceção nasce em outro método. As duas só apareceram parando o Docker de verdade.

⚠️ **Desligar por variável de ambiente não é desligar.** Ferramenta com descoberta automática de endpoint — Docker, proxy, DNS, resolvedor de pacote — trata a variável como preferência, não como ordem. Para medir a ausência, tire o recurso do ar.

## O instrumento que alcança metade

⛔ **Sonda, regra e correção nascem cobrindo uma forma, e a resposta está na outra.** Não basta que o instrumento funcione: ele precisa alcançar **onde o problema mora**. Três vezes na #242, cada uma de um jeito:

| O instrumento | O que ele alcançava | Onde a resposta estava |
| --- | --- | --- |
| `grep ... \| head` procurando quem mexia no scroll | as 10 primeiras linhas | na 11ª — e eu **descartei a hipótese certa** por causa disso |
| a regra `no-restricted-syntax` de tag crua | chamadas de `styled('nav')` | no JSX: três `<li>` passaram no código novo |
| a correção da fileira de paginação | a ponta inicial, onde a página 4 quebrava | na ponta final, onde a 9 quebrava igual |

Em 02/09/2026 entrou um quarto, de outra natureza: o predicado que é verdadeiro **por vacuidade**. Esperando o CI de um PR com `until gh pr checks <n> --json name,bucket | jq -e 'all(.bucket != "pending")'`, o laço saiu na primeira olhada e eu anunciei quatro checks verdes — havia **um** registrado, e `all()` sobre lista de um elemento é verdadeiro. Os outros três nem existiam, incluindo o único que importava naquele PR. A âncora que faltava é de cardinalidade:

```bash
until gh pr checks <n> --json name,bucket | jq -e 'length >= 4 and all(.bucket != "pending")'; do sleep 20; done
```

⛔ **`all`, `every` e `none` sobre coleção que ainda está sendo preenchida respondem "sim" sem medir nada.** Predicado de espera precisa dizer **quantos** itens espera, ou nomear o item que espera.

⛔ **`grep` ancorado sobre diff filtrado responde zero.** O `git diff` desta máquina sai em **formato compacto**, e a forma dele não é estável: numa invocação ele renderiza as linhas `+` indentadas, noutra ele resume. Então `grep -E "^\+"` não casa nada — e o zero se lê como "nenhuma linha", que é justamente a resposta tranquilizadora.

Medido em 03/09/2026 sobre um diff de 18 adições:

| Comando | Responde |
| --- | --- |
| `git diff \| grep -cE "^\+[^+]"` | **0** |
| `git diff --numstat` | **18** ✅ |
| `rtk proxy git diff \| grep -E "^\+" \| wc -l` | **19** ✅ |

**A saída depende do que você quer:** contagem vem de `--numstat`, que é machine-readable e não passa por filtro; linha crua para **classificar** (comentário, string, termo) exige `rtk proxy git diff`, que desvia o filtro. As duas rules que prescreviam a forma ingênua — a densidade de comentário em `parallelism-and-worktrees.md` e o detector de rename em `dotnet-code-style.md` — foram corrigidas por causa disto.

⛔ **E o complemento de "passou" não é "falhou".** No mesmo `gh pr checks`, tratar `bucket != "pass"` como falha reporta vermelho onde há `pending`: em 02/09/2026 anunciei um check falhando no #287 quando o front ainda estava `IN_PROGRESS`, porque a cascata da pilha havia reiniciado o CI. Estado de terceira via — `pending`, `skipping`, `neutral` — se nomeia, não se deduz por exclusão.

⚠️ **`| head` num `grep` de investigação é o pior dos três**, porque some com a evidência sem avisar e a saída parece completa. Em busca que vai sustentar conclusão, conte antes (`grep -c`) ou não trunque.

⛔ **Regra nova se prova nas duas formas.** O controle positivo de uma regra de lint não é só "reprova o que deve" — é também "aceita o que deve". Ao estender a de tag crua, rodei um arquivo com `<div>` **e** `<strong>` no mesmo JSX: o primeiro reprova, o segundo passa. Sem a segunda metade eu teria proibido ênfase de texto sem perceber.

⛔ **Correção com duas pontas se confere nas duas, enumerando.** Consertei a página 4 e entreguei; a 9 tinha o defeito espelhado e quem viu foi o Victor. O que resolveu foi listar **todos** os estados de 1 a 12 numa tabela e olhar a coluna inteira — as duas faixas usavam medidas diferentes, e isso só aparece lado a lado.

### Pior que alcançar metade: destruir a outra

⛔ **Instrumento que transforma texto precisa contar o que consumiu contra o que emitiu.** O que só mede erra devolvendo um número torto; o que reescreve erra **apagando** — e o arquivo salvo não denuncia o que sumiu.

Aconteceu em 01/09/2026, rebaseando cinco PRs cujas entradas de changelog caíam no mesmo ponto do arquivo. Escrevi um resolvedor que atribui cada linha à seção pelo cabeçalho `###` acima dela. Nos quatro primeiros o conflito envolvia o cabeçalho e funcionou. No quinto ele ficou **dentro** da lista, sem cabeçalho nenhum no bloco: o script não encontrou seção, atribuiu zero linhas e **gravou o arquivo sem elas**. Sumiram duas entradas — uma delas já mergeada na `develop`.

Ele imprimiu `seções fundidas:` com a lista vazia, e nada mais. O `git rebase` seguiu feliz.

**A guarda é aritmética, não cuidado:** conte as entradas do bloco de entrada, conte as que você atribuiu, e **aborte** quando os dois números não baterem. Uma linha de `assert` teria transformado uma perda silenciosa numa parada barulhenta.

⚠️ **O sinal é a saída vazia onde deveria haver enumeração.** "0 arquivos alterados", "nenhuma seção", "nada a fazer" — num passo que existe justamente para alterar algo, isso não é sucesso, é o instrumento dizendo que não entendeu a entrada.

## O artefato publicado não é o que você quis escrever

⛔ **Antes de afirmar o que um PR, uma issue ou um comentário seu diz, releia o publicado.** A lembrança guarda a **decisão** de registrar algo, e ela se lê exatamente igual a ter registrado — não há sensação diferente entre as duas.

Aconteceu em 03/09/2026, fechando a rodada do #297. Eu disse que o resíduo de contraste do popover estava declarado no corpo do PR, *"junto das duas alternativas medidas e recusadas"*. O corpo não mencionava a paleta em linha nenhuma, e o único comentário do PR era o do Sonar. Eu tinha decidido registrar aquilo enquanto media, e li a decisão como o registro.

**O gatilho é a frase que descreve conteúdo seu no passado** — "está no corpo do PR", "já registrei na issue", "o comentário explica". Cada uma é um comando que você ainda não rodou:

```bash
gh pr view <n> --json body -q .body
gh api repos/<dono>/<repo>/issues/<n>/comments --jq '.[].body'
```

⚠️ **O custo não é a frase errada, é o que ela desliga.** Quem lê para de procurar: o Victor ia mergear achando que a limitação estava documentada para quem viesse depois.

⚠️ **É diferente de afirmar sobre o que não li.** Ali a fonte é de outra pessoa e eu pulei a leitura; aqui a fonte é minha, e é justamente por isso que releitura não parece necessária.

## O que esta rule não é

Não é ordem de esgotar toda dúvida antes de abrir a boca. Ela vale no **fechamento** — ao dizer "pronto", abrir PR ou pedir confirmação. No meio do trabalho, resíduo em aberto é normal, e dizer que está em aberto é o certo.
