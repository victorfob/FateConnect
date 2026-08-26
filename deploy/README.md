# Publicar o FateConnect

Guia do zero: de uma VPS recém-criada até a aplicação no ar, com homologação e
produção separadas e HTTPS válido nas duas.

## O que sobe

Três peças, todas em contêiner:

- **A borda** — um nginx que é o único a falar com a internet. Ele olha o
  domínio de cada requisição e entrega ao ambiente certo. É também quem guarda
  os certificados.
- **Homologação** — front, as duas APIs e um Postgres só dela.
- **Produção** — o mesmo conjunto, com banco próprio e segredos próprios.

Os dois ambientes não compartilham nada além da borda. Cada um tem seu banco,
seu segredo de sessão e seu domínio; derrubar um não afeta o outro.

Homologação acompanha a branch `develop`; produção acompanha a `main`.

## 1. Antes de começar

### Os dois endereços, no DuckDNS

1. Entre em <https://www.duckdns.org> e faça login com sua conta do GitHub.
2. Crie **dois** subdomínios, por exemplo `fateconnect` e `fateconnect-hml`.
3. Em cada um, preencha o campo de IP com o endereço da sua VPS e salve.
4. Confira que os dois resolvem para o IP certo:

   ```bash
   nslookup fateconnect.duckdns.org
   nslookup fateconnect-hml.duckdns.org
   ```

O DuckDNS foi escolhido por um motivo técnico, não por acaso: ele está na
Public Suffix List, então cada subdomínio tem cota própria de emissão de
certificado. Serviços de DNS grátis que não estão nessa lista dividem a cota
entre todos os usuários e a renovação passa a falhar.

### Acesso por chave SSH

Na **sua máquina**, gere o par de chaves (uma vez só, se ainda não tiver):

```bash
ssh-keygen -t ed25519 -C "fateconnect-vps"
```

Envie a chave pública para a VPS — este comando pede a senha do servidor:

```bash
ssh-copy-id usuario@SEU_IP
```

Depois disso, crie um atalho em `~/.ssh/config` para não repetir o endereço:

```
Host fateconnect-vps
    HostName SEU_IP
    User usuario
```

E teste: `ssh fateconnect-vps` deve entrar sem pedir senha.

## 2. Preparar a VPS

Conectado na VPS, instale Docker e git:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo apt-get update && sudo apt-get install -y git
```

Saia e entre de novo (`exit`, depois `ssh fateconnect-vps`) para o grupo
`docker` valer. Confirme:

```bash
docker run --rm hello-world
```

### Fechar o que não precisa estar aberto

Deixe abertas só as portas de SSH e web:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

O Postgres **não** aparece nessa lista de propósito: ele só existe dentro da
rede interna do Docker e não deve ser alcançável de fora.

## 3. Clonar e configurar

```bash
git clone https://github.com/victorfob/FateConnect.git
cd FateConnect/deploy
```

Crie os três arquivos de configuração a partir dos modelos:

```bash
cp .env.example .env.hml
cp .env.example .env.prod
cp edge/.env.example edge/.env
```

Gere os segredos — **um diferente para cada campo e para cada ambiente**:

```bash
openssl rand -base64 32
```

Preencha `.env.hml` e `.env.prod` (senha do banco, segredo de sessão e o
`PUBLIC_URL` com `http://` por enquanto), e `edge/.env` com os dois domínios e
seu e-mail.

Nenhum desses arquivos é versionado — eles têm senha dentro e o repositório é
público.

## 4. Subir

O front é construído fora do contêiner, e o `deploy.sh` espera encontrá-lo
pronto. Publicando à mão, gere antes:

```bash
./build-front.sh hml && ./deploy.sh hml
./build-front.sh prod && ./deploy.sh prod
```

O `deploy.sh` puxa a branch do ambiente, constrói as APIs e sobe tudo. O banco
nasce vazio e as tabelas são criadas pelas migrations na primeira subida, sem
nenhum passo manual.

Pela pipeline nada disso é digitado: o runner constrói o front, envia o
resultado e chama o `deploy.sh`. Ver a seção **Publicar pela pipeline**.

Confira nos dois endereços, ainda em `http://`.

## 5. Ligar o HTTPS

Com os dois já respondendo e os domínios apontando para a VPS:

```bash
./enable-https.sh
```

Ele confere que os domínios chegam na máquina, pede os certificados, troca a
borda para HTTPS e reconstrói os dois fronts com o endereço novo — esse último
passo é necessário porque o Vite grava o endereço da API dentro do bundle.

Agende a renovação, já que o certificado vale 90 dias:

```bash
crontab -e
```

E acrescente:

```
0 3 * * 1 cd ~/FateConnect/deploy && ./renew-https.sh >> /var/log/fateconnect-certbot.log 2>&1
```

## Publicar pela pipeline

Com os segredos configurados, publicar deixa de ser um comando: mergear na
`develop` publica homologação, e mergear na `main` publica produção junto com a
tag da release.

O front é construído **no runner**, não na VPS. É isso que mantém os source
maps enviados ao Sentry descrevendo o bundle que está no ar — construir de novo
no servidor geraria outro bundle, e o erro apontaria a linha errada sem nada
acusar.

### O que configurar no GitHub

Em **Settings → Environments**, crie `hml` e `prod`. Em produção, marque
*Required reviewers* com você mesmo: assim o push na `main` fica parado até
alguém aprovar, e homologação segue direto.

Em cada ambiente, cadastre as **variables**:

| Variable | Exemplo |
| --- | --- |
| `PUBLIC_URL` | o endereço daquele ambiente, com `https://` |
| `VITE_SENTRY_DSN` | o DSN do Sentry, se usar |
| `SENTRY_ORG`, `SENTRY_PROJECT` | idem |

E os **secrets**:

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

Gere uma chave **separada** da sua, para poder revogá-la sem perder seu acesso:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N "" -C "github-actions-fateconnect"
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

O conteúdo de `~/.ssh/github-actions` (sem o `.pub`) vai no secret
`DEPLOY_SSH_KEY`. Ele nunca deve ser colado em conversa, chamado ou commit.

## Dia a dia

| O que você quer | Comando |
| --- | --- |
| Publicar o que entrou na `develop` | `./build-front.sh hml && ./deploy.sh hml` |
| Publicar uma release | `./build-front.sh prod && ./deploy.sh prod` |
| Ver o que está de pé | `docker compose -p fateconnect-prod ps` |
| Ler os logs | `docker compose -p fateconnect-prod logs -f` |
| Reiniciar um ambiente | `docker compose -p fateconnect-hml restart` |

### Backup do banco

```bash
docker compose -p fateconnect-prod exec -T db \
  pg_dump -U fateconnect fateconnect > backup-$(date +%F).sql
```

Guarde o arquivo fora da VPS. Não há backup automático configurado.

## Quando algo dá errado

**Um domínio responde 502.** Aquele ambiente está fora; o outro segue no ar.
Veja o motivo com `docker compose -p fateconnect-hml logs`.

**A borda não sobe depois de ligar o HTTPS.** Algum certificado não foi
emitido. Volte `EDGE_CONF=http-only.conf` em `edge/.env`, suba a borda de novo e
rode o `enable-https.sh` outra vez.

**O front carrega mas nenhuma tela com dados funciona.** O endereço da API
gravado no bundle está errado. Confira `PUBLIC_URL` no `.env` do ambiente e
rode `./build-front.sh <ambiente>` de novo — reiniciar não basta, e o
`deploy.sh` sozinho também não, porque o endereço entra na hora de construir.

**O deploy para dizendo que falta o front.** Ninguém gerou o `dist` daquele
ambiente ainda. Rode o `build-front.sh`, ou dispare a pipeline.

**O deploy para dizendo que há alterações não commitadas.** Alguém editou algo
direto na VPS. Veja com `git status` e descarte se não houver nada a salvar —
o deploy troca de branch e não passa por cima disso.

## O que ainda não existe

- **Achados e perdidos não funciona no ar.** O front chama `/achado`, e nenhuma
  das duas APIs implementa esse caminho ainda. As telas vão dar erro até a API
  existir.
- **Nenhum backup automático** do banco.
- **Backup do banco continua manual.**
