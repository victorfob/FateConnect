---
name: lighthouse-audit
description: >-
  Audita o site publicado com o Lighthouse — todas as categorias que a versão instalada oferecer, em
  desktop e celular, nas telas públicas e nas autenticadas — e transforma os apontamentos em issues.
  Use quando o usuário pedir para auditar, medir ou rodar o Lighthouse, checar desempenho,
  acessibilidade, SEO, boas práticas ou navegação agêntica
  do site no ar, ou refazer a linha de base depois de a aplicação ganhar telas. Cobre a matriz de
  medição, como medir tela logada sem digitar senha, e o que **não** vira issue.
---

# Auditar o site publicado com o Lighthouse

A auditoria é **medição, não correção**. Ela termina entregando um relatório e abrindo issue para cada apontamento que exija código — nunca corrigindo de passagem.

A primeira rodada foi a #361, em 12/09/2026, e os números dela estão no relatório daquela issue. Use-os como ponto de comparação; o que envelhece é o número, não o procedimento.

## 1. Antes de medir: o mundo que você vai medir é o que vai ficar?

⛔ **Correção conhecida e ainda não publicada envenena a linha de base.** Ela aparece como apontamento, some na publicação seguinte, e o relatório passa a descrever um mundo que já não existe.

Antes de rodar, confira o que está no ar **em cada ambiente** — o que está mergeado não é o que está publicado:

```bash
curl -sI -H 'Accept-Encoding: gzip' <ambiente>/assets/<um .js de lá> | grep -i 'content-encoding\|cache-control'
```

Havendo diferença entre ambientes, **não escolha um**: meça os dois. Foi o que a #361 fez, e o desenho é este:

| Papel | Qual ambiente | O que ele responde |
| --- | --- | --- |
| Linha de base | o que já tem a correção | a pontuação que vale daqui para frente |
| Controle | o que ainda não tem | quanto vale a publicação pendente |

⚠️ **A comparação só é legítima se os dois rodarem o mesmo hardware e bundles equivalentes.** Prove as duas coisas: o DNS dos dois resolvendo para o mesmo IP, e a soma dos bytes crus de cada `dist/`. Na #361 deu **0,23%** de diferença, e é isso que permite atribuir o delta à configuração em vez de ao código.

## 2. A matriz

Ambientes × telas × desktop e celular, **3 execuções por célula**, mediana na tabela e a faixa entre parênteses quando houver variação.

```bash
lighthouse "<url>" [--preset=desktop] \
  --output=json --output-path="<saída>.json" \
  --chrome-flags="--headless=new --no-sandbox" --quiet
```

Sem `--preset` o Lighthouse já mede celular. Uma execução leva ~14 s.

⛔ **Não relate uma execução só.** Uma rodada isolada vira baseline falsa — já aconteceu noutra frente deste repo, com um número de CI que se mostrou 45% otimista na medição seguinte. Três execuções custam 42 s e mostram a dispersão.

### ⛔ Instale a versão mais recente, nunca um major

```bash
npm i lighthouse            # e não lighthouse@<major>
lighthouse --version        # anote no relatório
```

⛔ Aconteceu na primeira rodada, a da #361: instalei `lighthouse@12` e recebi a **12.8.2** com a **13.4.1** publicada. As quatro notas batiam nas duas versões, então nada acusou — o que ficou invisível foi uma **categoria inteira**, `agentic-browsing`, que só existe a partir da 13 e onde o site marcava 67.

⚠️ **A lista de categorias não é fechada.** Quem descobriu o buraco foi o Victor, abrindo o PageSpeed Insights — que roda sempre a versão hospedada — e vendo uma categoria que nenhum relatório meu tinha. **Confira o conjunto de categorias do relatório contra o que o PageSpeed mostra**, em vez de supor que são quatro.

### ⛔ Auditoria migra entre versões, e uma delas perde o nome

Comparando a mesma página na 12.8.2 e na 13.4.1, **cinco** auditorias foram reestruturadas. Quatro só mudaram de nome, virando *insights*:

| Antes | Depois |
| --- | --- |
| `uses-long-cache-ttl` | `cache-insight` |
| `uses-http2` | `modern-http-insight` |
| `legacy-javascript` | `legacy-javascript-insight` |

**A quinta não tem sucessor:** `uses-text-compression` deixou de existir, e na 13 nenhuma auditoria nomeia a compressão dos estáticos. A que sobrou perto disso, `document-latency-insight`, olha só o documento e **passa**, porque o HTML já vai comprimido.

⛔ **O efeito é uma regressão invisível ao contrário:** com 1 MB de JavaScript cru no ar, a versão nova simplesmente não menciona compressão. Quem comparar rodadas pelo **id** da auditoria lê isso como "resolvido".

**Compare o achado, não o id** — e, ao reauditar, liste os ids que sumiram desde a rodada anterior e vá procurar onde cada um foi parar. Sumiço sem sucessor é o caso perigoso, porque ele se parece com sucesso.

### Escolha as telas pelo que elas acrescentam

Na #361, `/menu` transferiu **exatamente o mesmo** que a landing pública, e `/caronas` +4 KiB. O peso do bundle já está todo na landing, porque ela carrega os pedaços por `modulepreload`. **A tela logada que vale medir é a que traz algo novo** — imagem, lista longa, dado da API.

## 3. O controle da rede, antes de confiar em qualquer tamanho

⛔ **A rede desta máquina já recomprimiu conteúdo em trânsito.** Antes de relatar tamanho transferido, prove que o que chega é o que está em disco:

```bash
# na VPS
ls -l /var/www/fateconnect/<ambiente>/assets/<arquivo>.js.gz
# daqui
curl -sI -H 'Accept-Encoding: gzip' <ambiente>/assets/<arquivo>.js | grep -i content-length
```

⛔ **E a versão do protocolo que o relatório mostra pode não ser a do servidor.** Havendo terminação de TLS no caminho, o navegador negocia com o intermediário, e a coluna `Protocol` descreve **aquela** conexão — o painel de rede inteiro, junto.

Medido em 12/09/2026: a auditoria de homologação listou `http/1.1` em **todas** as requisições enquanto o servidor aceitava `h2`. O que discrimina vem de graça na mesma conexão:

```bash
curl -sv -o /dev/null https://<ambiente>/ 2>&1 | grep -iE "issuer:|ALPN"
```

Emissor diferente do certificado real do site ⇒ o transporte do relatório é do intermediário, e **o item de HTTP moderno não vira issue**. Como o servidor de fato responde se mede de dentro do host, com `--resolve` para o loopback.

Batendo no byte, os tamanhos valem. Registre isso no relatório — e registre junto a **latência medida** (`ping`) e o `benchmarkIndex` que o próprio Lighthouse reporta, porque são eles que dizem a que máquina e a que rede aquele número pertence.

## 4. Tela autenticada: o usuário loga, você nunca

⛔ **Você não digita senha.** O caminho é abrir um Chrome com **perfil dedicado** e porta de depuração, pedir que o usuário logue nele, e rodar o Lighthouse contra esse navegador.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="<scratchpad>/chrome-perfil" \
  --no-first-run --no-default-browser-check "<ambiente>/inicio" &
```

⚠️ Perfil dedicado, não o perfil real: o Chrome do usuário não roda com depuração aberta, e reiniciá-lo custaria as abas dele. O perfil sobrevive a fechar e reabrir a janela — se ele fechar sem querer, relance com o mesmo `--user-data-dir` e a sessão continua lá.

### As duas armadilhas que fazem a medição mentir

⛔ **`--disable-storage-reset` é obrigatório, e ele traz um efeito colateral.** Sem a flag, o Lighthouse limpa o armazenamento antes de medir — e o token mora no `localStorage`. A sessão morre, o guard manda a rota logada para a landing, e **você mede a landing achando que mediu a tela logada**.

⛔ **Mas a flag preserva o cache junto.** Aí a carga fica quente e deixa de ser comparável com a tabela pública. A saída é limpar **só o cache HTTP**, por CDP, antes de cada execução — `Network.clearBrowserCache` numa aba descartável.

```bash
lighthouse "<url autenticada>" [--preset=desktop] \
  --port=9222 --disable-storage-reset \
  --output=json --output-path="<saída>.json" --quiet
```

### ⛔ A guarda que torna o resultado confiável

**Perder a sessão e medir a tela errada são o mesmo evento**, e ele é silencioso: o relatório sai completo, com números plausíveis, da página errada. O que denuncia é a URL final.

```js
const final = new URL(relatorio.finalDisplayedUrl).pathname;
if (final !== rotaPedida) throw new Error(`sessão perdida: pedi ${rotaPedida}, caiu em ${final}`);
```

⚠️ **Prove a guarda antes de confiar nela.** Num contexto anônimo do mesmo navegador (`Target.createBrowserContext`), abra a rota logada e confirme que ela cai na landing — é o controle negativo, e é o que mostra que o verificador **consegue** dizer "não". Na #361 o usuário logou antes de eu rodar o controle, e sem o contexto anônimo eu teria um verificador nunca exercitado.

⚠️ **Confirme também que a carga foi fria**, somando o transferido: algumas centenas de KiB vieram da rede; perto de zero veio do cache.

⛔ **Ao terminar, feche o Chrome e apague o perfil** — ele guarda a sessão do usuário em disco. Confirme que a porta 9222 parou de responder.

## 5. Ler os achados

Junte os apontamentos reprovados de **todos** os relatórios e conte em quantas células cada um aparece. A distribuição já classifica:

| Padrão | Significa |
| --- | --- |
| só num ambiente | é de configuração daquele ambiente |
| em todos, desktop e celular | é de código ou de conteúdo |
| só no desktop | é de algo que o estreito esconde (item que vira gaveta) |
| só onde há imagem ou lista longa | é de dado, não de bundle |

### Separar o que é nosso do que vem de biblioteca

⛔ **Este passo é fácil de pular e muda a issue inteira.** Na #361, **92%** do JavaScript não usado e **100%** do código legado eram de dependência. Isso reposicionou o trabalho: não era "enxugar o nosso código", era "decidir o que entra na primeira carga".

Atribua por arquivo, e diga a proporção no relatório.

### ⚠️ Imagem por `blob:` mente no tamanho

Foto que o front baixa com token e converte em `blob:` aparece com `transferSize` **zero** — a transferência aconteceu como `Fetch`, não como `Image`. Quem diz o custo real é o `totalBytes` dos apontamentos de imagem. Na #361 eram **2 MB** que o somatório de `transferSize` das imagens daria como grátis.

## 6. O que **não** vira issue

⛔ **Confira cada apontamento contra as decisões do repositório antes de abrir issue.** Duas famílias:

- **Decisão deliberada nossa.** O Lighthouse pede compressão na resposta da API; ela sai crua de propósito, porque o `location /api/` declara `gzip off` por causa do BREACH. Abrir issue para isso é pedir para desfazer uma decisão de segurança.
- **Apontamento de peso zero.** Parte dos itens de acessibilidade é informativa e não move a nota — `label-content-name-mismatch` é um. Vale citar no relatório, não abrir issue.

⛔ **Homologação reprova `is-crawlable` de propósito, e isso derruba a categoria inteira.** Desde a #384 o `robots.txt` de lá responde `Disallow: /`, porque a verificação do domínio no Search Console cobre o subdomínio. Medido em 12/09/2026: o SEO de homologação foi a **58** por dois achados, e este era um deles. Não abra issue, e não "conserte" — a comparação de SEO entre ambientes só vale descontando este item.

**Registre os dois no relatório, nomeados**, com a frase que impede alguém de "consertar" depois.

## 7. O que a ferramenta não enxerga

Diga isto no relatório, senão o silêncio se lê como aprovação:

- **Tema escuro.** O Lighthouse roda no claro e não expõe emulação de `prefers-color-scheme`. Achado de cor precisa ser conferido à parte na outra paleta.
- **Desempenho de gente de verdade.** O número é de laboratório, de uma máquina e de uma rede. Ele compara rodadas feitas do mesmo jeito; não descreve o que alguém sente.
- **Acessibilidade completa.** A checagem automática alcança uma fração do que a WCAG exige. Nota 100 não é tela acessível.

## 8. O relatório

Comentário na issue da auditoria, e ele precisa de **data e versão publicada** — sem elas ninguém sabe, meses depois, a que código aquele número pertence. Mais: as condições de medição (versão do Lighthouse, execuções por célula, `benchmarkIndex`, latência), a tabela de pontuação por combinação, e cada apontamento com o custo medido.

⛔ **Nenhum endereço de ambiente, chave ou token no corpo.** Escreva "produção" e "homologação". A chave pública do Sentry aparece na lista de requisições do relatório — ela não vai para o comentário.

Depois, uma issue por apontamento que exija código, pela skill `spec-issue`. Agrupe pelo que compartilha o arquivo e o custo de publicar: na #361 os três achados de nginx viraram **uma** issue, porque cada mudança no template cobra um `install-site.sh` manual em cada ambiente.

## Armadilhas de ferramenta já pagas

| Sintoma | Causa |
| --- | --- |
| `no matches found: --include=*.cs` | o zsh tenta expandir o glob antes do comando; aspas resolvem — `--include='*.cs'` |
| `preset[@]: unbound variable` | `set -u` com array vazio no bash 3.2 do macOS; use `${arr[@]+"${arr[@]}"}` |
| `/robots.txt` responde 200 com HTML | o nginx serve o `index.html` para qualquer caminho; o validador acusa uma linha de erro por linha do HTML |
