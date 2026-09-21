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

⛔ **Pseudo-classe que o navegador não deixa forçar não tem controle positivo — e aí a medição é outra.** O `CSS.forcePseudoState` do protocolo cobre `:hover`, `:focus`, `:active`, `:visited`, `:focus-within` e `:focus-visible`, e **não** cobre `:-webkit-autofill`. Em 05/09/2026, ao conferir se declarar `color-scheme` tinha tornado redundante a sombra que pinta o campo preenchido, não havia como pôr o campo naquele estado — nem forçando, nem digitando, porque credencial não se digita em formulário.

O que respondeu foi ler a **cascata**, não o pixel: percorrer `document.styleSheets` juntando toda regra cujo `cssText` cita a pseudo-classe. Saíram duas, na ordem em que o navegador as aplica — a da própria biblioteca e a nossa, depois dela —, e a ordem **é** a resposta.

⚠️ **Relatar isso como "medi o preenchimento automático" seria falso.** O que se mediu foi qual regra vence; que a regra vencedora pinta o que promete continua por conferir. Diga a frase que descreve o instrumento, não a que descreve o que você queria saber.

⛔ **Controle positivo em outro alvo não limpa o alvo que interessa.** Ele responde se o **instrumento** funciona; não responde se o caminho até **este** alvo é limpo. E ele engana justamente por parecer rigor — você rodou um controle, então se sente coberto.

Aconteceu em 12/09/2026, conferindo se o `http2 on;` recém-instalado tinha pegado. Daqui a resposta foi `HTTP/1.1` em todos os caminhos, e eu ia relatar que a diretiva não funcionava. O controle que rodei — três sites conhecidos negociando `h2` desta mesma máquina — provava só que **aqueles** hosts não eram rebaixados. Medida de dentro do próprio servidor, a mesma rota respondeu `ALPN: server accepted h2`.

**O controle que vale é da própria conexão que você está medindo**, e ali ele vinha de graça no mesmo comando: o emissor do certificado. Diferente do esperado ⇒ há intermediário terminando a conexão, e tudo que ela diz sobre **transporte** — versão de protocolo, cifra, tamanho comprimido — é do intermediário. Status e corpo atravessam intactos, e foi por isso que os 404 e os `Content-Type` da mesma medição estavam todos certos.

⚠️ **O tell é o número contrariar uma configuração que você acabou de provar noutra bancada.** A diretiva estava provada num nginx da mesma versão em contêiner; quando o ambiente real discordou, a hipótese barata era o instrumento, não a configuração.

## O instrumento que alcança metade

⛔ **Sonda, regra e correção nascem cobrindo uma forma, e a resposta está na outra.** Não basta que o instrumento funcione: ele precisa alcançar **onde o problema mora**. Três vezes na #242, cada uma de um jeito:

| O instrumento | O que ele alcançava | Onde a resposta estava |
| --- | --- | --- |
| `grep ... \| head` procurando quem mexia no scroll | as 10 primeiras linhas | na 11ª — e eu **descartei a hipótese certa** por causa disso |
| a regra `no-restricted-syntax` de tag crua | chamadas de `styled('nav')` | no JSX: três `<li>` passaram no código novo |
| a correção da fileira de paginação | a ponta inicial, onde a página 4 quebrava | na ponta final, onde a 9 quebrava igual |
| a medição de layout numa largura só | 1440px, onde a coluna está no teto de 600px | entre 933 e 1056px, onde ela divide a linha com o cartão de login |
| a varredura que comparava **toda string** do diff | `'…'`, `"…"` e `` `…` `` | num **regex literal**: `/nome deve ter ao menos/i` |

A quarta linha custou uma segunda rodada de review. Em 04/09/2026 a varredura devolveu 11 achados, eu corrigi os 11 e declarei o PR limpo; faltavam dois — as asserções do teste que guardava a copy, escritas como regex. Eles só apareceram porque a suíte ficou **vermelha** depois da correção.

⚠️ **Texto de código mora em cinco formas: string, template, regex, comentário — e bloco de código, onde não há crase nenhuma.** Instrumento que lê quatro responde com a mesma confiança sobre as quatro, e o silêncio sobre a quinta se lê como ausência.

A quinta forma apareceu em 09/09/2026, ao levar para o inglês os nomes da API que seis issues abertas citavam. Meu buscador procurava token entre crases e devolveu seis issues; a #162 tinha **treze** nomes em português fora de crase — num bloco `csharp`, num bloco de JSON e num diagrama de setas. Quem os achou não foi o buscador: foi a guarda que reclama de sobra depois da substituição.

Em 02/09/2026 entrou um quarto, de outra natureza: o predicado que é verdadeiro **por vacuidade**. Esperando o CI de um PR com `until gh pr checks <n> --json name,bucket | jq -e 'all(.bucket != "pending")'`, o laço saiu na primeira olhada e eu anunciei quatro checks verdes — havia **um** registrado, e `all()` sobre lista de um elemento é verdadeiro. Os outros três nem existiam, incluindo o único que importava naquele PR. A âncora que faltava é de cardinalidade:

```bash
until gh pr checks <n> --json name,bucket | jq -e 'length >= 4 and all(.bucket != "pending")'; do sleep 20; done
```

⛔ **`all`, `every` e `none` sobre coleção que ainda está sendo preenchida respondem "sim" sem medir nada.** Predicado de espera precisa dizer **quantos** itens espera, ou nomear o item que espera.

⚠️ **E a cardinalidade envelhece — prefira nomear.** Em 14/09/2026 o mesmo laço, com `length >= 4`, saiu com quatro checks registrados e **sem** o da API, que é o único que mede um PR de backend: o número estava certo para o PR de front de onde ele veio, e o conjunto de checks depende do que o PR toca.

```bash
until gh pr checks <n> --json name,bucket \
  | jq -e 'any(.[]; .name == ".NET API") and all(.[]; .bucket != "pending")'; do sleep 20; done
```

**Nomear o check que você espera** não envelhece com o filtro de caminhos, e diz no próprio comando o que a espera existe para provar.

⛔ **Nomear resolve a espera, e não resolve o relato: a lista de checks só fica completa no fim.** O laço pergunta *já posso ler?*, e para isso nomear basta. O relatório afirma *passou tudo* — e aí não há o que nomear, porque check que ainda não foi criado não aparece em lista nenhuma.

Medido em 21/09/2026, no #451. Esperei nomeando `.NET API` e `Version`, o que estava certo, e li o resultado com `gh pr checks <n> | tail -12`. Havia **13** linhas: o `tail` cortou exatamente o `React front (Web)`, que era o vermelho, e eu anunciei "12 de 12 verdes". Consertado o job, a lista fechou em **14** — o novo é o check que o Sonar do front publica, e ele não existia antes porque o passo que o cria tinha ficado `skipped`.

⚠️ **Então `length >= N` também não salvaria: o N cresce conforme o run anda.** Relato se lê da lista inteira, e o resumo **nomeia cada bucket** em vez de contar o complemento de `pass` — a seção abaixo já diz por quê, e eu reincidi nela ao escrever esta: o primeiro resumo que escrevi aqui usava `select(.bucket != "pass")` e acusou **2 reprovados** no PR desta própria rule, que eram os dois `skipping` do filtro de caminhos.

```bash
gh pr checks <n> --json name,bucket --jq '.[] | "\(.bucket)\t\(.name)"' | sort
gh pr checks <n> --json name,bucket --jq 'group_by(.bucket)[] | "\(.[0].bucket)=\(length)"'
```

⛔ **`grep` ancorado sobre diff filtrado responde zero.** O `git diff` desta máquina sai em **formato compacto**, e a forma dele não é estável: numa invocação ele renderiza as linhas `+` indentadas, noutra ele resume. Então `grep -E "^\+"` não casa nada — e o zero se lê como "nenhuma linha", que é justamente a resposta tranquilizadora.

Medido em 03/09/2026 sobre um diff de 18 adições:

| Comando | Responde |
| --- | --- |
| `git diff \| grep -cE "^\+[^+]"` | **0** |
| `git diff --numstat` | **18** ✅ |
| `rtk proxy git diff \| grep -E "^\+" \| wc -l` | **19** ✅ |

**A saída depende do que você quer:** contagem vem de `--numstat`, que é machine-readable e não passa por filtro; linha crua para **classificar** (comentário, string, termo) exige `rtk proxy git diff`, que desvia o filtro. As duas rules que prescreviam a forma ingênua — a densidade de comentário em `parallelism-and-worktrees.md` e o detector de rename em `dotnet-code-style.md` — foram corrigidas por causa disto.

⛔ **O mesmo filtro engole a saída do `grep`, e devolve uma contagem no lugar dela.** Procurando cor cravada dentro de um pacote publicado, `rtk grep` respondeu **`4 matches in 0 files`** e não imprimiu uma linha sequer. Não é zero achados e não é erro: os quatro existiam e eram exatamente o que eu procurava — `/usr/bin/grep` imprimiu os quatro na hora.

⚠️ **O tell é a contagem discordar da listagem**: `N matches` com nada embaixo. Vale para qualquer comando que passe por filtro — quando a saída vai sustentar conclusão, confira que o que foi contado é o que foi mostrado.

⛔ **E o mesmo envelope infla: ele acrescenta linha, e o `wc -l` conta o enfeite.** Em 10/09/2026, conferindo o que ia num commit, `git diff --cached --name-only | wc -l` respondeu **14** para **11** arquivos preparados — a diferença era cabeçalho e rodapé impressos pelo filtro. Quem discriminou foi a listagem ao lado, com os 11 caminhos certos; a contagem sozinha teria me mandado caçar três arquivos que não existiam.

⚠️ **Contagem que vai conferir alguma coisa se lê na saída crua** — `rtk proxy <comando>` — ou se conta na listagem. Engolir e inflar são o mesmo defeito: medir através de algo que reescreve a saída.

⛔ **E o envelope pode comer a ENTRADA, e aí o comando não roda.** Engolir e inflar dão número errado sobre algo que aconteceu; este dá veredito sobre algo que **nunca executou** — e o resultado não é um falso verde, é um falso **vermelho** cravado no alvo que você estava medindo.

Medido em 21/09/2026, com o controle nas três formas:

| Comando | Responde |
| --- | --- |
| `dotnet build -v q --nologo` | **`0 projects, 1 errors`**, `Project file does not exist` |
| `rtk proxy dotnet build -v q --nologo` | `0 Error(s)` ✅ |
| `dotnet build --verbosity quiet --nologo` | `3 projects, 0 errors` ✅ |

O `-v q` são dois argumentos, o filtro fica com o `q`, e o build nunca recebe projeto. A linha do meio é o controle que separa culpa do filtro de culpa do comando. **Flag curta com valor separado se escreve por extenso**, ou o comando vai por `rtk proxy`. A skill `create-release` prescrevia a primeira forma e foi corrigida junto.

⛔ **E o complemento de "passou" não é "falhou".** No mesmo `gh pr checks`, tratar `bucket != "pass"` como falha reporta vermelho onde há `pending`: em 02/09/2026 anunciei um check falhando no #287 quando o front ainda estava `IN_PROGRESS`, porque a cascata da pilha havia reiniciado o CI. Estado de terceira via — `pending`, `skipping`, `neutral` — se nomeia, não se deduz por exclusão.

⛔ **Job vermelho reporta o primeiro passo que caiu, e nada sobre os seguintes.** O que vem depois dele não passou: **não rodou**. Ler "está vermelho por causa de X" como "só X está errado" é tratar o não-medido como aprovado — e o passo escondido costuma ser o gate, que fica no fim.

Medido em 14/09/2026, no #391. O job `.NET API` reprovava em 9 testes e eu relatei o CI como uma falha só. Corrigidos os testes, o job alcançou pela primeira vez o passo do Sonar e caiu de novo: o gate reprovava por duplicação em código novo desde sempre, e nenhuma corrida tinha chegado a medi-lo.

**Quem discrimina é a lista de passos, não o resumo do check:**

```bash
gh run view <run-id> --json jobs --jq '.jobs[].steps[] | "\(.conclusion)\t\(.name)"'
```

As duas corridas, lado a lado, são o controle: antes `failure Tests` → **`skipped`** no passo do Sonar; depois `success Tests` → `failure` nele. `skipped` depois de um `failure` é passo que ninguém mediu.

⛔ **`performance.getEntriesByType('resource')` não enxerga requisição que falha na conexão.** Em 04/09/2026, provando que um formulário deixara de chamar a API, ele devolveu **zero** nos dois casos — no que não devia chamar e no que devia. O zero era do instrumento. Quem responde é o log de rede do navegador (`read_network_requests`), que registra a tentativa com o motivo da falha; e o par positivo — o caso que **deve** disparar a requisição — é o que separa "não chamou" de "não medi".

⛔ **E há a busca que só alcança o que tem nome de símbolo.** Um pedido entregue deixa rastro em **dois** lugares independentes — o código e o rastreador —, e o `grep` só responde bem quando existe um identificador a procurar.

Em 10/09/2026 varri dezesseis pedidos antigos "por código, não de memória" e declarei seis em aberto. **Quatro tinham issue própria, fechada e entregue.** Os quatro eram os **visuais** — largura de cartão, altura de ícone, recuo de rodapé, alinhamento de diálogo —, e nenhum deles tem símbolo: recuo não se procura por nome.

⚠️ **O tell é o pedido descrever geometria ou aparência.** Aí a pergunta muda de lugar:

```bash
gh issue list --state all --limit 300 --json number,title,state \
  --jq '.[] | select(.title | test("<termo do pedido>"; "i")) | "#\(.number) [\(.state)] \(.title)"'
```

⛔ **`grep` casa caixa e acento literalmente, e o zero se lê como ausência.** Duas medições minhas quase viraram relatório errado por isso, e as duas eram sobre **rename**:

| Busca | Respondeu | O real |
| --- | --- | --- |
| `per[ií]odo` no corpo de uma issue, locale C | **0** | **4** — o `í` são dois bytes, e a expressão de colchete não o alcança |
| `onlyMyItems` na base | **13 em 5 arquivos** | **18 em 8** — a API escreve `OnlyMyItems` |

O segundo é o pior: eu ia relatar que os arquivos de API haviam desaparecido e que alguém já tinha feito o rename. **Busca que vai sustentar conclusão sobre presença ou contagem roda com `-i` e com `LC_ALL=pt_BR.UTF-8`**, e o controle é procurar um trecho que você sabe que existe — não aparecendo, o instrumento está cego, e não o repositório vazio.

⛔ **E há o instrumento que nem chegou a rodar: no zsh, `--include=*.ts` sem aspas é expandido pelo shell.** Sem arquivo `.ts` no diretório atual, o zsh aborta o comando inteiro com `no matches found` — e o que sobra na tela é o cabeçalho que você mesmo imprimiu com `echo`, que se lê como "procurei e não achei nada".

Medido em 14/09/2026: duas buscas seguidas morreram assim ao procurar quem lê claim do token no front, e as duas pareceram zero. **Aspas no padrão** — `--include='*.ts'` — e, quando o zero for sustentar conclusão, confira que o comando rodou: `echo "exit=$?"` logo depois.

⚠️ **`| head` num `grep` de investigação é o pior dos três**, porque some com a evidência sem avisar e a saída parece completa. Em busca que vai sustentar conclusão, conte antes (`grep -c`) ou não trunque.

⛔ **E não é só busca: truncar a saída de um comando que pode falhar apaga o motivo da falha.** Em 10/09/2026 um `git push | tail -2` deixou na tela `failed to push some refs` sem a linha que dizia por quê; empurrei de novo, funcionou, e o motivo da primeira reprovação está perdido para sempre. **Comando que pode falhar vai sem filtro, ou com a saída inteira num arquivo** — o `tail` entra depois, sobre o arquivo, que continua ali para reler.

⛔ **Mutação que não alterou o arquivo não matou nada — e se apresenta como acerto.** Ao provar um verificador, confira que cada mutante **difere** do original antes de ler o veredito: `cmp -s` resolve. Em 11/09/2026 três mutações minhas usaram `sed` com expressão inválida; ele falhou, o arquivo saiu vazio, o verificador reprovou por isso, e eu contabilizei três mortes que nunca aconteceram. A saída do `sed` estava na tela e eu li o resultado do verificador em vez dela.

⚠️ **O sintoma é o mutante morrer rápido demais ou todos morrerem de primeira.** Verificador que reprova o arquivo vazio reprova qualquer erro de escrita do mutante, então o kill não diz nada sobre o invariante que você quis testar.

⛔ **Regra nova se prova nas duas formas.** O controle positivo de uma regra de lint não é só "reprova o que deve" — é também "aceita o que deve". Ao estender a de tag crua, rodei um arquivo com `<div>` **e** `<strong>` no mesmo JSX: o primeiro reprova, o segundo passa. Sem a segunda metade eu teria proibido ênfase de texto sem perceber.

⛔ **Correção com duas pontas se confere nas duas, enumerando.** Consertei a página 4 e entreguei; a 9 tinha o defeito espelhado e quem viu foi o Victor. O que resolveu foi listar **todos** os estados de 1 a 12 numa tabela e olhar a coluna inteira — as duas faixas usavam medidas diferentes, e isso só aparece lado a lado.

⛔ **Zero de comando composto não vale sem saber onde ele rodou.** Um `cd` que falha em `cd X && grep ...` deixa o `grep` rodar no diretório anterior, e o zero se lê como "não existe". Em 04/09/2026 afirmei que o projeto não tinha regra de autofill nenhuma; tinha zero **naquele** diretório, que não era o do front. `pwd` entra na mesma saída sempre que o zero vai sustentar conclusão.

⛔ **Antes de atribuir um artefato à sua mudança, remova a mudança.** Correlação não é autoria. No mesmo dia vi seletores quebrados aparecerem junto da minha regra de CSS e disse ao Victor que eram meus; removendo a regra e recarregando frio, os nove continuavam lá — eram do MUI. O tell é a frase *"isso apareceu depois que eu mexi"*.

### A prova local cobre a ferramenta, não o trajeto

⛔ **Provar que a ferramenta faz o que promete não prova que o dado chega ao passo seguinte.** Entre um passo e outro há transporte — artefato, volume, rede, disco —, e ele não existe na sua máquina: você o pula sem perceber, porque localmente os dois passos compartilham o mesmo diretório.

⛔ Aconteceu em 11/09/2026, ao fatiar a suíte de testes no CI. Provei o Vitest inteiro na máquina: dois shards, relatório `blob`, fusão, cobertura idêntica à corrida cheia, inventário de testes do Sonar. Os **dois** defeitos que apareceram estavam fora disso:

| O que quebrou | Por que a prova local não alcançava |
| --- | --- |
| passo rodando antes do `checkout` herdava um diretório que ainda não existia | localmente o diretório sempre existe |
| o upload de artefato ignora arquivo oculto, e o relatório mora em `.vitest-reports` | localmente ninguém sobe artefato: o passo seguinte lê o mesmo disco |

**O tell é a sua prova e o seu alvo rodarem no mesmo processo ou no mesmo diretório**, quando em produção eles são dois. Antes de declarar provado, pergunte por onde o dado **viaja** entre um e outro — e conte o que chegou do outro lado, não o que saiu deste.

### Largura é dimensão de varredura, não um ponto

⛔ **Layout responsivo se mede na faixa em que ele muda de forma, e o defeito mora entre os pontos que você escolheu.** Medir "no desktop" é medir um pixel de uma faixa de mil, e o verde dali não fala pelos outros novecentos.

Três vezes em 11/09/2026, na mesma rodada:

| O que eu media | Onde o defeito estava |
| --- | --- |
| a fileira de destaques a 1440px, com a coluna nos 600px do teto | a 982px, onde a coluna tem **351px** porque divide a linha com o cartão de login |
| a correção que apliquei, de novo a 1440px | na faixa 933–1056px, que a própria correção reintroduziu |
| nada: o cabeçalho vinha quebrado da branch anterior | entre 933 e 980px, onde a gaveta já tinha sumido e a nav ainda não cabia |

Nas três quem viu foi o Victor, olhando a tela.

**Os pontos que a faixa exige:** cada limite declarado e **um pixel de cada lado dele** — é ali que os dois estados se encostam e o buraco aparece —, mais a largura em que cada contêiner elástico para de crescer.

⚠️ **Elemento que divide a linha com outro não tem a largura da janela.** A coluna da landing vai de 314px a 600px enquanto a janela vai de 937 a 1920, e é a **dela** que decide a quebra. Meça a largura do contêiner junto da janela, sempre — como já se faz com a porta.

⛔ **E o eixo esquecido nem sempre é espacial: pode ser o tempo desde que o artefato nasceu.** Em 11/09/2026, medindo se um `Cache-Control` novo mudava alguma coisa, o navegador respondeu **zero requisição** tanto com ele quanto sem — e o controle contra produção é que denunciou o empate. O que faltava segurar era a **idade do arquivo**: sem `Cache-Control`, o navegador arbitra a validade em ~10% da idade, então recém-publicado ele revalida tudo e dias depois não revalida nada. A mesma configuração responde diferente conforme o dia em que se mede.

O A/B só discriminou depois de `touch` nos arquivos e duas portas, com cache separado: **7 revalidações contra 0**. Antes disso, os dois lados diziam a mesma coisa e a conclusão seria "não muda nada".

### Pior que alcançar metade: destruir a outra

⛔ **Instrumento que transforma texto precisa contar o que consumiu contra o que emitiu.** O que só mede erra devolvendo um número torto; o que reescreve erra **apagando** — e o arquivo salvo não denuncia o que sumiu.

Aconteceu em 01/09/2026, rebaseando cinco PRs cujas entradas de changelog caíam no mesmo ponto do arquivo. Escrevi um resolvedor que atribui cada linha à seção pelo cabeçalho `###` acima dela. Nos quatro primeiros o conflito envolvia o cabeçalho e funcionou. No quinto ele ficou **dentro** da lista, sem cabeçalho nenhum no bloco: o script não encontrou seção, atribuiu zero linhas e **gravou o arquivo sem elas**. Sumiram duas entradas — uma delas já mergeada na `develop`.

Ele imprimiu `seções fundidas:` com a lista vazia, e nada mais. O `git rebase` seguiu feliz.

**A guarda é aritmética, não cuidado:** conte as entradas do bloco de entrada, conte as que você atribuiu, e **aborte** quando os dois números não baterem. Uma linha de `assert` teria transformado uma perda silenciosa numa parada barulhenta.

⚠️ **O sinal é a saída vazia onde deveria haver enumeração.** "0 arquivos alterados", "nenhuma seção", "nada a fazer" — num passo que existe justamente para alterar algo, isso não é sucesso, é o instrumento dizendo que não entendeu a entrada.

⛔ **Na esteira isso tem nome e padrão: o passo que não achou nada avisa e segue verde.** O `actions/upload-artifact` nasce com `if-no-files-found: warn`, então um caminho errado sobe **zero arquivo** e o job fica verde; quem quebra é o passo que ia consumir o artefato, num job adiante, longe da causa. Em 11/09/2026 gastei um ciclo inteiro de CI nisso — o diretório era `.vitest-reports`, e o upload ignora arquivo oculto por padrão.

**Passo que transporta exige as duas guardas:** `if-no-files-found: error` de um lado, e do outro **contar o que chegou** antes de usar — um relatório por shard, conferido, separa "a suíte reprovou" de "os relatórios não chegaram".

⛔ **Tabela de substituição confere também que cada regra dela disparou.** Regra que nunca casa não faz nada e não reclama: o arquivo sai plausível, com um trecho intacto no meio do que você acha que traduziu.

⛔ **E o instrumento que destrói pode ser um `UPDATE` de uma linha: coluna que o pedido não nomeia fica de fora.** Escrever apaga o valor anterior, e num banco não há diff para abrir depois — o que estava ali some sem deixar registro.

Aconteceu em 14/09/2026, promovendo duas contas a administrador em homologação. O comando pedido era `SET "ProfileType" = 2`; eu acrescentei `"UpdatedAt" = now()` por conta própria e sobrescrevi os dois valores anteriores sem tê-los lido. Um deles era real: `IncrementTokenVersionAsync` grava ali a cada logout, e aquela conta tinha 12 versões de token.

**A guarda são dois passos, e o que faltou foi o primeiro:** `SELECT` das colunas que você vai **escrever**, antes, e `RETURNING` no `UPDATE` para conferir o número de linhas. Eu tinha o `RETURNING`; do `SELECT` eu tinha lido `ProfileType` e `TokenVersion`, que eram as colunas do pedido — não a que eu ia escrever por fora dele.

⚠️ **E `now()` não é `DateTime.UtcNow`.** A VPS roda em `America/Sao_Paulo` e a API grava UTC em coluna `timestamp without time zone`, então SQL manual com `now()` planta um valor três horas fora da convenção da aplicação e nada reclama. Escrevendo timestamp à mão, `timezone('UTC', now())`.

Na mesma tradução de 09/09/2026, a reescrita de uma frase inteira da #193 nunca casou — as trocas de token que rodaram antes já tinham mudado `Operador` para `Operator` **dentro dela**, então o texto que eu procurava já não existia. Quem parou foi o `assert` de que toda entrada casou ao menos uma vez. **Reescrita de frase vai antes das trocas de token**, e entre as trocas a ordem é do mais longo para o mais curto: sem isso `AgenteUsuario` vira `AgenteUser`.

## O número que eu prometo se deriva rodando, não contando

⛔ **Valor esperado que vai junto de um comando para outra pessoa rodar se obtém executando aquele comando exato.** Contar de cabeça o que ele *deveria* achar transforma a conferência em ruído: quem roda recebe um número diferente e não sabe se o defeito é do ambiente ou do seu palpite.

Aconteceu em 13/09/2026, entregando `grep -cE 'http2 on;|gzip_static on;|immutable'` com "tem que responder 3" — as três diretivas que eu tinha na cabeça. Respondeu **4**: o **comentário** acima de `http2 on;` cita a própria diretiva que documenta. O Victor teve que perguntar se estava errado.

⚠️ **O tell é montar o comando a partir de uma busca anterior com padrão diferente.** O padrão mudou, o número não foi refeito. Comando novo ⇒ rodar antes de prometer a saída — e, quando a contagem for sustentar conclusão, listar **quais** linhas casaram (`grep -n`), porque a listagem denuncia o casamento que você não previu.

## O comando de conferência tem referência própria, e pode não ser a sua

⛔ **Provar contenção contra uma referência não autoriza um comando que mede contra outra.** Os dois números estão certos e respondem perguntas diferentes — e o segundo parece contradizer o primeiro.

Na mesma rodada: provei `git rev-list --count origin/main..release/0.10.0` = **0** e mandei `git branch -d`. Ele recusou com *"not fully merged"*, porque **o `-d` mede contra a branch em que você está** — a `develop`, que ainda não tinha recebido o back-merge. Nada estava perdido; a recusa era sobre outra coisa.

**O teste que responde a pergunta certa é explícito na referência:**

```bash
git merge-base --is-ancestor <branch> origin/main   # exit 0 = está toda lá
```

⚠️ Provado assim, o `-D` é seguro — e a prova vai dita junto, senão forçar parece atalho.

⛔ **E contenção se mede restrita aos arquivos que a branch tocou.** `git diff <branch> develop` sobre a árvore inteira devolve também tudo que entrou na base **depois** — e isso se lê como trabalho seu que ficou de fora, quando é exatamente o contrário.

Aconteceu em 14/09/2026, limpando a `feat/409` já mergeada: o comando respondeu 46 inserções e eu quase tratei como conteúdo perdido. Eram as regras de um PR que entrou na `develop` em seguida.

```bash
base=$(git merge-base develop <branch>)
git diff --name-only "$base" <branch> > /tmp/tocados.txt
wc -l < /tmp/tocados.txt          # zero aqui é o instrumento falhando, não contenção
tr '\n' '\0' < /tmp/tocados.txt | xargs -0 git diff <branch> develop --
```

Saída vazia **com a contagem acima de zero** ⇒ nesses arquivos a base está idêntica à branch, e nada ficou de fora.

⚠️ **A contagem não é zelo: sem ela o passo mente conforme o `xargs`.** Com lista vazia, o `xargs` do BSD não roda nada e o do GNU roda o comando sem pathspec — aí ele imprime a árvore inteira e você lê como conteúdo perdido.

## O alcance de uma mudança de token se mede no consumidor renderizado

⛔ **Antes de afirmar o que uma troca de cor ou de token vai atingir, não basta achar quem lê a chave: confira se aquele caminho chega à tela.** O `grep` responde quem **referencia**; ele não responde quem **renderiza**.

Aconteceu em 09/09/2026, ao escolher o tom do botão neutro no tema escuro. Apresentei uma tabela afirmando que escurecer `palette.primary` degradaria o logotipo, com o contraste medido em cada candidato — e o número condenava três dos quatro tons. Estava errada duas vezes: o símbolo da marca tem dois tons e o que aparece no cromo pinta com `currentColor`, não com a chave; e o tom que **lê** a chave não tem consumidor nenhum na aplicação, só três linhas de teste.

Quem derrubou a tabela foi a pergunta *"não entendi pq o logotipo muda"*. Sem ela, a cor teria sido escolhida contra uma restrição que não existe.

**O tell é a medição que restringe demais.** Quando a conta elimina quase todas as opções, confira a premissa antes de aceitar o resultado: é mais provável que o alcance esteja errado do que a janela ser tão estreita.

## O relato dele contra a sua medição: suspeite do recorte

⛔ **Quando o que ele vê rodando contradiz o que você mediu, o errado é quase sempre o recorte da medição — não o relato.** Ele está olhando o produto inteiro; você está olhando um arquivo.

Aconteceu em 10/09/2026. Eu medi que o `httpClient` do front descarta o corpo da resposta de erro — verdade, nenhum arquivo lê `error` — e afirmei que **a tela** mostra sempre a frase genérica. O Victor testou o cadastro, viu `Este e-mail já está em uso…` e perguntou *"tem certeza que o usuário vê essa mensagem genérica na tela?"*. Não tinha: três telas e nove requisições escrevem a copy delas, escolhida por `status` ou por `field`. A minha medição estava certa sobre o interceptor e eu a estendi para a camada de cima.

**O tell é o sujeito da afirmação ser mais largo que o arquivo aberto** — eu disse "a tela mostra" tendo lido o interceptor. Antes de responder que o relato está errado, liste o que ainda está **entre** a sua medição e o que ele vê, e abra cada um.

⚠️ **A versão específica disto já estava escrita em `web-styling.md`**, para alinhamento — *"ao receber 'não está alinhado' sobre algo que você mediu, desconfie do que foi medido antes de duvidar do relato"*. Ela vale para qualquer medição, não só geometria, e é por isso que subiu para cá: aquela rule carrega só em arquivo do front.

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

### Truncar o artefato que você audita inventa o achado

⛔ **Lendo um artefato para saber se algo FALTA, leia inteiro.** `| head`, `sed -n '1,80p'` e `--jq` recortado devolvem uma ausência com a mesma cara da ausência real — e aqui o truncamento não erra um número: ele **produz um achado que não existe**, e ele chega com a confiança de quem "leu a issue".

⛔ Aconteceu em 14/09/2026. Levantei que os documentos legais não descreviam o módulo de denúncias e que faltava registrar isso na #162. A seção estava lá desde 12/09, **escrita por mim** na review daquele mesmo PR: o corpo tem 112 linhas, a seção começa na 99, e eu tinha lido com `head -80`. Quem viu foi o Victor — *"se eu não me engano já tem uma issue pra atualizar os termos"*.

**O tell é a conclusão ser uma ausência.** Achado de presença se confere abrindo o que você achou; achado de ausência não tem o que abrir, então o instrumento é a única testemunha — e instrumento truncado testemunha a favor.

```bash
gh issue view <n> --json body -q .body > /tmp/corpo.md && wc -l < /tmp/corpo.md
```

⚠️ **É o irmão da seção acima, e custa mais.** Lá eu afirmo que um registro meu existe sem reler; aqui eu afirmo que ele não existe tendo lido só o começo — e a saída é abrir trabalho novo em cima de trabalho que já estava feito.

## O contorno pode ter mais de um motivo, e o comentário registra um

⛔ **Antes de remover um contorno, enumere todos os motivos dele.** O painel de notificações estreitava no celular e o comentário justificava pela seta, que saía do gatilho. Consertada a seta, tirei o estreitamento achando que a razão tinha acabado — havia uma segunda, não escrita: 320px numa tela de 412 ocupam quase quatro quintos, e o painel deixa de parecer painel. Quem viu foi o Victor, com captura.

**O comentário diz por que aquilo nasceu, não a lista completa do que ele sustenta.** Ao apagar, pergunte o que mais depende daquilo — e meça a consequência, em vez de deduzi-la do texto ao lado.

## O controle que mede um caminho já corrigido

⛔ **Controle positivo só vale se nada mais tiver consertado aquele caminho antes.** Em 04/09/2026 removi um efeito que eu suspeitava ser desnecessário e medi desvio zero — mas naquele cenário eu tinha redimensionado a janela com o painel **aberto**, e o listener de `resize` já havia recalculado o valor. O verde era de outro mecanismo, e eu removi uma correção correta.

**O tell é o controle passar quando você esperava que falhasse.** Ali, em vez de concluir, liste o que mais poderia produzir aquele resultado.

⚠️ **Comportamento de biblioteca se lê no `node_modules`, não se infere da tela.** O que fechou a questão foi ver que o `Popover` do MUI chama `setPositioningStyles` num efeito passivo sem lista de dependências — três rodadas de medição não tinham chegado lá.

## O que esta rule não é

Não é ordem de esgotar toda dúvida antes de abrir a boca. Ela vale no **fechamento** — ao dizer "pronto", abrir PR ou pedir confirmação. No meio do trabalho, resíduo em aberto é normal, e dizer que está em aberto é o certo.
