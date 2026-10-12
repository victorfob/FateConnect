# Publicar o FateConnect

Guia do zero: de uma VPS até a aplicação no ar, com homologação e produção
separadas e HTTPS válido nas duas.

## O que sobe, e o que já existe

**PostgreSQL** e **nginx** rodam no host, uma cópia só para os dois ambientes;
o `vps-setup.sh` os instala. A API e a fila de e-mail vão em contêiner:

| Peça | Onde roda |
| --- | --- |
| Banco | PostgreSQL do host, com **um banco por ambiente** |
| Front | arquivos estáticos servidos pelo nginx do host |
| API | um contêiner por ambiente, escutando só em `127.0.0.1` |
| Fila de e-mail | um RabbitMQ por ambiente, ao lado da API, também só em `127.0.0.1` e com teto de 512 MB |

O que separa os ambientes é banco, segredo, domínio e porta local. Derrubar um
não afeta o outro.

Homologação acompanha a branch `develop`; produção acompanha a `main`.

## 1. Endereços

Produção responde na raiz do domínio, homologação num subdomínio:

| Ambiente | Endereço | Porta local |
| --- | --- | --- |
| Produção | `fateconnect.com.br` | 8201 |
| Homologação | `hml.fateconnect.com.br` | 8101 |

No painel de DNS, crie **dois registros A** apontando para o IP da VPS: um para
a raiz (`@`) e outro para `hml`. Confira antes de seguir — o certificado só é
emitido se os dois já resolverem:

```bash
dig +short fateconnect.com.br
dig +short hml.fateconnect.com.br
```

Um domínio próprio foi preferido a DNS dinâmico gratuito por dois motivos
concretos: redes corporativas costumam bloquear a categoria inteira de DNS
dinâmico, o que deixaria a aplicação inacessível de dentro delas; e domínios
compartilhados por milhares de usuários dividem a cota semanal de emissão de
certificado do Let's Encrypt, o que torna a renovação pouco confiável.

## 2. Acesso por chave SSH

Na **sua máquina**, envie sua chave pública para o servidor — este comando pede
a senha da VPS:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@SEU_IP
```

Se ainda não tiver uma chave, gere com `ssh-keygen -t ed25519`. **Nunca
sobrescreva uma chave existente**: isso invalida todo acesso que dependa dela.

## 3. Preparar o servidor

Clone o repositório e rode o preparador **uma vez**, com `sudo`:

```bash
git clone https://github.com/victorfob/FateConnect.git
cd FateConnect/deploy
sudo ./vps-setup.sh
```

Ele instala PostgreSQL 17, nginx, certbot, fail2ban e Docker, fecha a porta do
banco para a internet com firewall, permite que os contêineres alcancem o
PostgreSQL do host, e cria um banco e um usuário por ambiente — gravando cada
senha em `/root/password-<banco>.txt`.

⚠️ **O PostgreSQL escuta em todas as interfaces de propósito**
(`listen_addresses = '*'`): o contêiner chega pelo gateway do Docker, que não é
`localhost` para o banco. Quem impede o acesso de fora é o firewall, que só
libera a 5432 para a faixa dos contêineres. Voltar para `localhost` derruba as
duas APIs.

Saia e entre de novo no SSH para o grupo `docker` valer.

## 4. Configurar

```bash
cp .env.example .env.hml
cp .env.example .env.prod
```

Preencha os dois. As senhas do banco estão em `/root/password-fateconnect_hml.txt`
e `/root/password-fateconnect_prod.txt`; gere os segredos de sessão com
`openssl rand -base64 32`, **diferentes** em cada ambiente. Deixe `PUBLIC_URL`
com `http://` por enquanto.

`SIXLABORS_LICENSE` recebe o conteúdo inteiro do arquivo `sixlabors.lic`, entre aspas
simples: a API gera a miniatura das fotos com o ImageSharp, e o build da imagem reprova
sem a licença. Ela entra como segredo do build: não aparece no log do deploy nem chega à
imagem que sobe. O arquivo
nunca vai para o repositório: o `.gitignore` e o `.dockerignore` o recusam.

O envio de e-mail pede quatro variáveis, e **a API não sobe sem as três primeiras**:

| Variável | Conteúdo |
| --- | --- |
| `PUBLIC_URL` | o mesmo endereço do ambiente; os links dos e-mails partem dele |
| `EMAIL_SENDER` | o remetente, num domínio verificado no Resend |
| `RESEND_API_KEY` | a chave do Resend daquele ambiente |
| `RABBITMQ_USER`, `RABBITMQ_PASS` | o usuário da fila; troque o `guest` do exemplo por uma senha gerada com `openssl rand -base64 32` |

As portas da fila seguem a faixa da API: `RABBITMQ_PORT` e `RABBITMQ_UI_PORT` em
8102 e 8103 na homologação, 8202 e 8203 na produção.

⚠️ **Sem envio, ninguém entra.** O login recusa a conta que não confirmou o
e-mail, inclusive as que já existiam antes da confirmação, e a de quem administra.
Preencha as variáveis e confira que um e-mail de teste chega **antes** de
publicar a versão que passou a exigir a confirmação.

Nenhum desses arquivos é versionado — eles têm senha dentro, e o repositório é
público.

## 5. Publicar

Uma vez por ambiente, instale a configuração no nginx:

```bash
sudo ./install-site.sh hml
sudo ./install-site.sh prod
```

Depois construa o front e suba a API:

```bash
./build-front.sh hml && ./deploy.sh hml
./build-front.sh prod && ./deploy.sh prod
```

A pipeline não usa o `build-front.sh`: ela constrói o front no runner, por
causa dos source maps do Sentry (seção abaixo). Para fazer o mesmo à mão,
construa em outra máquina e envie o resultado:

```bash
# na sua máquina, dentro de FateConnect/Web
VITE_API_URL=https://hml.fateconnect.com.br/api \
yarn build
rsync -az --delete dist/ usuario@servidor:/var/www/fateconnect/<ambiente>/
```

O banco de cada ambiente nasce vazio e as tabelas são criadas pelas migrations
na primeira subida, sem passo manual.

O que **não** nasce sozinho é o primeiro administrador: todo cadastro entra
como operador, e a área de gestão fica inalcançável até alguém ser promovido
por um `UPDATE`. O comando está em
[DATABASE.md](DATABASE.md#promover-alguém-a-administrador), e o passo é uma vez
por ambiente, depois de a pessoa ter se cadastrado pela tela.

Confira os dois endereços em `http://`.

## 6. Ligar o HTTPS

Com os domínios respondendo:

```bash
sudo certbot --nginx -d fateconnect.com.br
sudo certbot --nginx -d hml.fateconnect.com.br
```

O certbot edita a configuração do nginx sozinho e instala um agendamento de
renovação. Confira com `systemctl list-timers | grep certbot`.

⚠️ **O bloco 443 que ele escreve fica dentro do arquivo que o `install-site.sh`
gera.** Rodar o script de novo sobrescreveria o arquivo inteiro e derrubaria o
HTTPS — por isso ele reaplica o TLS sozinho quando já existe certificado para o
domínio. Se a HTTPS sumir depois de um `install-site.sh`, foi isso, e
`sudo certbot --nginx -d <domínio>` devolve.

Depois troque `PUBLIC_URL` para `https://` nos dois `.env` e **reconstrua o
front** — o endereço da API fica gravado dentro do bundle, então reiniciar não
basta:

```bash
./build-front.sh hml && ./deploy.sh hml
./build-front.sh prod && ./deploy.sh prod
```

## Publicar pela pipeline

Com os segredos configurados, mergear na `develop` publica homologação e
mergear na `main` publica produção junto da tag da release.

O front é construído **no runner**, não na VPS. É isso que mantém os source
maps enviados ao Sentry descrevendo o bundle que está no ar — construir de novo
no servidor geraria outro bundle, e o erro apontaria a linha errada sem nada
acusar.

### O que configurar no GitHub

Em **Settings → Environments**, crie `hml` e `prod`. É o ambiente que separa o
endereço de cada destino; o push na `main` publica em produção direto.

**Variable de cada ambiente** — é a única coisa que muda entre `hml` e `prod`:

| Variable | Conteúdo |
| --- | --- |
| `PUBLIC_URL` | o endereço daquele ambiente, com `https://` |

**Variables do repositório**, valendo para os dois ambientes:

| Variable | Conteúdo |
| --- | --- |
| `VITE_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` | se usar Sentry |

**Secrets do repositório** — a VPS é a mesma nos dois ambientes, então não há
motivo para duplicá-los por ambiente:

| Secret | Conteúdo |
| --- | --- |
| `DEPLOY_HOST` | o endereço da VPS |
| `DEPLOY_USER` | o usuário do SSH |
| `DEPLOY_SSH_KEY` | a chave **privada** dedicada à pipeline |
| `DEPLOY_PATH` | o caminho do clone na VPS |
| `DEPLOY_KNOWN_HOSTS` | a identidade pública do servidor — veja abaixo |
| `SENTRY_AUTH_TOKEN` | se usar Sentry |

O `PUBLIC_URL` da variable e o do `.env` na VPS precisam ser o mesmo endereço:
um alimenta o bundle, o outro libera o CORS da API.

### A chave da pipeline

Gere **na VPS** uma chave separada da sua, para poder revogá-la sem perder seu
acesso:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N "" -C "github-actions"
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

O conteúdo de `~/.ssh/github-actions` (sem o `.pub`) vai no secret
`DEPLOY_SSH_KEY`. Ele nunca deve ser colado em conversa, chamado ou commit.

### A identidade do servidor

A pipeline não descobre mais a identidade da VPS a cada publicação: ela a lê do
secret `DEPLOY_KNOWN_HOSTS`. Gere o conteúdo **na própria VPS**, lendo as chaves
na fonte, e cole a saída inteira no secret:

```bash
for f in /etc/ssh/ssh_host_*_key.pub; do echo "<endereços> $(cut -d' ' -f1,2 "$f")"; done
```

⛔ **Não gere com `ssh-keyscan`.** Ele abre uma conexão por tipo de chave, em
paralelo, e o `MaxStartups` do sshd descarta conexão nova quando a fila de
preauth está cheia — o estado normal de uma máquina exposta à internet. Medido
em 08/09/2026: duas execuções seguidas devolveram conjuntos diferentes, e uma
devolveu nada. Foi por isso que ele saiu do workflow, e é por isso que não serve
nem para gerar o secret à mão. Ler `/etc/ssh` não usa rede e traz todas.

**`<endereços>` é uma lista separada por vírgula**, e é o detalhe que faz ou
quebra: o ssh procura a chave pelo **nome que o cliente digitou**, então a
entrada precisa citar o mesmo valor que está em `DEPLOY_HOST`. Como o mesmo
servidor atende por vários nomes — o domínio de cada ambiente, o hostname do
provedor, o IP —, listar todos dispensa saber qual forma o secret guarda:

```
dominio-de-um-ambiente,dominio-do-outro,hostname-do-provedor,IP ssh-ed25519 AAAA...
```

Confira antes de mergear, salvando num arquivo o mesmo texto que foi para o
secret. O `ssh-keygen` faz a mesma busca que o ssh faria, sem conectar em nada:

```bash
ssh-keygen -F <endereço> -f <arquivo>
```

Todo endereço da lista precisa ser encontrado, e um endereço de fora precisa
**não** ser — senão a linha virou curinga em vez de cobertura.

⚠️ **Sem esse secret a publicação para no passo da chave**, dizendo o que falta —
de propósito, porque um `known_hosts` vazio derruba o `rsync` três passos
adiante, com uma mensagem que não aponta para a causa. Trocar a chave do
servidor — numa reinstalação, por exemplo — passa a exigir atualizar o secret.

## Como o código chega na VPS

O `deploy.sh` se atualiza antes de qualquer outra coisa: `fetch`, `checkout` da
branch daquele ambiente — `develop` para `hml`, `main` para `prod` —,
`pull --ff-only`, e então **se re-executa** na versão recém-baixada. Não existe
`git pull` manual.

O checkout é **um só** para os dois ambientes, então publicar troca a branch
dele. É daí que vem o comportamento que mais surpreende: **produção continua no
mundo da última release** mesmo com a `develop` bem à frente, porque o
`deploy.sh prod` volta para a `main` antes de construir. O contêiner da API é
construído desse mesmo checkout, então ele segue a branch do ambiente.

Justamente por ser compartilhado, **duas publicações nunca correm juntas**: o
`deploy.sh` toma uma trava da máquina antes de trocar a branch, e a segunda
espera a primeira terminar, dizendo isso no log. Vale para qualquer origem — as
duas pipelines ou uma sessão SSH.

⚠️ **O que o deploy não faz é mexer no nginx.** Mudou `nginx/site.conf.template`?
Rode `sudo ./install-site.sh <ambiente>`, uma vez por ambiente — é o único passo
manual de uma publicação. Ele reaplica o HTTPS sozinho quando já existe
certificado para o domínio.

## Dia a dia

| O que você quer | Comando |
| --- | --- |
| Publicar a `develop` | `./build-front.sh hml && ./deploy.sh hml` |
| Publicar uma release | `./build-front.sh prod && ./deploy.sh prod` |
| Ver o que está de pé | `docker compose -p fateconnect-prod ps` |
| Ler os logs | `docker compose -p fateconnect-prod logs -f` |
| Ver a memória | `free -h` |

Para olhar os dados de homologação pelo DBeaver — túnel SSH e campos de
conexão —, veja [DATABASE.md](DATABASE.md).

### Backup do banco

```bash
sudo -u postgres pg_dump fateconnect_prod > backup-$(date +%F).sql
```

Guarde o arquivo fora da VPS. Não há backup automático configurado.

### Trocar de VPS

A máquina nova sobe pelas seções 2 a 5, com a antiga ainda no ar. O que vem da
antiga, nesta ordem:

1. **Os dois `.env`**, copiados como estão. Depois, iguale a senha de cada
   usuário do banco novo à do `.env` (`ALTER USER ... WITH PASSWORD`) e
   atualize `/root/password-<banco>.txt`.
2. **Os bancos**, com `pg_dump -Fc --no-owner --no-acl` na antiga e
   `pg_restore --no-owner --no-acl --role=fateconnect_<ambiente>` na nova, para
   as tabelas ficarem com o usuário do ambiente. Compare a contagem de linhas
   de cada tabela nos dois lados.
3. **As fotos**, que moram no volume `fateconnect-<ambiente>_api_uploads`:
   `tar` de um contêiner na antiga para um na nova, com o volume criado antes
   com as etiquetas do Compose.
4. **O front publicado** em `/var/www/fateconnect/`, que é o mesmo bundle cujos
   source maps estão no Sentry.
5. **Os certificados**: `/etc/letsencrypt` inteiro, e então o
   `install-site.sh` de cada ambiente devolve o HTTPS. Assim a virada não passa
   nenhum minuto sem HTTPS.
6. **O DNS**: troque os dois registros A. O que for gravado na antiga entre a
   cópia dos bancos e o fim do cache do DNS (1 hora) se perde; para não perder,
   pare as APIs da antiga antes de copiar.
7. **Os segredos `DEPLOY_*`** do GitHub, com a chave e a identidade do servidor
   novo (seção "Publicar pela pipeline").

## Quando algo dá errado

**O site responde 502.** A API daquele ambiente está fora. Veja com
`docker compose -p fateconnect-hml logs`.

**Um contêiner morre sozinho, sem erro claro.** Quase sempre é falta de
memória: o kernel encerra o processo que mais consome. Confirme com
`dmesg | grep -i "killed process"` e veja o que dá para liberar com `free -h`.

**O front carrega mas nenhuma tela com dados funciona.** O endereço da API
gravado no bundle está errado. Confira `PUBLIC_URL` e rode o `build-front.sh`
de novo — o `deploy.sh` sozinho não resolve, porque o endereço entra na hora de
construir.

**O e-mail de confirmação, de redefinição ou de desbloqueio não chega.** A
mensagem fica guardada no banco até a fila aceitá-la, e a falha do envio aparece
no log da API. Veja se a fila está de pé com
`docker compose -p fateconnect-hml ps` e o motivo com
`docker compose -p fateconnect-hml logs api`.

**O deploy para dizendo que há alterações não commitadas.** Alguém editou algo
direto na VPS. Veja com `git status` e descarte se não houver nada a salvar.

## O que ainda não existe

- **Backup do banco é manual.**
