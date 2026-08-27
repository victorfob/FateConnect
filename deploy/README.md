# Publicar o FateConnect

Guia do zero: de uma VPS até a aplicação no ar, com homologação e produção
separadas e HTTPS válido nas duas.

## O que sobe, e o que já existe

O servidor já tem **PostgreSQL** e **nginx**. Numa máquina de 1 GB, subir
cópias dos dois em contêiner gastaria memória que não sobra — então eles são
reaproveitados:

| Peça | Onde roda |
| --- | --- |
| Banco | PostgreSQL do host, com **um banco por ambiente** |
| Front | arquivos estáticos servidos pelo nginx do host |
| APIs | dois contêineres por ambiente, escutando só em `127.0.0.1` |

O que separa os ambientes é banco, segredo, domínio e porta local. Derrubar um
não afeta o outro.

Homologação acompanha a branch `develop`; produção acompanha a `main`.

## 1. Endereços

Produção responde na raiz do domínio, homologação num subdomínio:

| Ambiente | Endereço | Portas locais |
| --- | --- | --- |
| Produção | `fateconnect.com.br` | 8201 / 8202 |
| Homologação | `hml.fateconnect.com.br` | 8101 / 8102 |

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

Ele instala o Docker, fecha a porta do banco para a internet com firewall,
permite que os contêineres alcancem o PostgreSQL do host, e cria um banco e um
usuário por ambiente — gravando cada senha em `/root/password-<banco>.txt`.

O script **não desliga nada** por conta própria. Ao final ele sugere o que dá
para liberar de memória, e a decisão é sua.

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

Nenhum desses arquivos é versionado — eles têm senha dentro, e o repositório é
público.

## 5. Publicar

Uma vez por ambiente, instale a configuração no nginx:

```bash
sudo ./install-site.sh hml
sudo ./install-site.sh prod
```

Depois construa o front e suba as APIs:

```bash
./build-front.sh hml && ./deploy.sh hml
./build-front.sh prod && ./deploy.sh prod
```

⚠️ **Num servidor de 1 GB o `build-front.sh` não conclui.** O Vite precisa de
mais de 500 MB de heap e o Node aborta com `JavaScript heap out of memory`,
sem gerar nada. Nesse caso construa o front em outra máquina e envie o
resultado — que é exatamente o que a pipeline faz:

```bash
# na sua máquina, dentro de FateConnect/Web
VITE_API_URL=https://hml.fateconnect.com.br/api/conta \
VITE_RIDE_API_URL=https://hml.fateconnect.com.br/api/carona \
yarn build
rsync -az --delete dist/ usuario@servidor:/var/www/fateconnect/<ambiente>/
```

O banco de cada ambiente nasce vazio e as tabelas são criadas pelas migrations
na primeira subida, sem passo manual.

Confira os dois endereços em `http://`.

## 6. Ligar o HTTPS

Com os domínios respondendo:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d fateconnect.com.br
sudo certbot --nginx -d hml.fateconnect.com.br
```

O certbot edita a configuração do nginx sozinho e instala um agendamento de
renovação. Confira com `systemctl list-timers | grep certbot`.

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

Em **Settings → Environments**, crie `hml` e `prod`. Em produção, marque
*Required reviewers*: assim o push na `main` fica parado até alguém aprovar.

**Variables**, em cada ambiente:

| Variable | Conteúdo |
| --- | --- |
| `PUBLIC_URL` | o endereço daquele ambiente, com `https://` |
| `VITE_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` | se usar Sentry |

**Secrets**, em cada ambiente:

| Secret | Conteúdo |
| --- | --- |
| `DEPLOY_HOST` | o endereço da VPS |
| `DEPLOY_USER` | o usuário do SSH |
| `DEPLOY_SSH_KEY` | a chave **privada** dedicada à pipeline |
| `DEPLOY_PATH` | o caminho do clone na VPS |
| `SENTRY_AUTH_TOKEN` | se usar Sentry |

O `PUBLIC_URL` da variable e o do `.env` na VPS precisam ser o mesmo endereço:
um alimenta o bundle, o outro libera o CORS das APIs.

### A chave da pipeline

Gere **na VPS** uma chave separada da sua, para poder revogá-la sem perder seu
acesso:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N "" -C "github-actions"
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

O conteúdo de `~/.ssh/github-actions` (sem o `.pub`) vai no secret
`DEPLOY_SSH_KEY`. Ele nunca deve ser colado em conversa, chamado ou commit.

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

## Quando algo dá errado

**O site responde 502.** As APIs daquele ambiente estão fora. Veja com
`docker compose -p fateconnect-hml logs`.

**Um contêiner morre sozinho, sem erro claro.** Quase sempre é falta de
memória: o kernel encerra o processo que mais consome. Confirme com
`dmesg | grep -i "killed process"` e veja o que dá para liberar com `free -h`.

**O front carrega mas nenhuma tela com dados funciona.** O endereço da API
gravado no bundle está errado. Confira `PUBLIC_URL` e rode o `build-front.sh`
de novo — o `deploy.sh` sozinho não resolve, porque o endereço entra na hora de
construir.

**O deploy para dizendo que há alterações não commitadas.** Alguém editou algo
direto na VPS. Veja com `git status` e descarte se não houver nada a salvar.

## O que ainda não existe

- **Achados e perdidos não funciona no ar.** O front chama `/achado` e nenhuma
  das duas APIs implementa esse caminho ainda. As telas vão dar erro até a API
  existir.
- **Backup do banco é manual.**
