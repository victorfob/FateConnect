# Acessar o banco de homologação

O PostgreSQL está fechado para a internet pelo firewall, de propósito: um banco
com a porta 5432 exposta é varrido por bots em minutos. O caminho é **túnel
SSH**, que o DBeaver abre sozinho — você não precisa de terminal para conectar.

Este guia cobre **homologação**. Produção é acessada pela pessoa responsável
pela publicação.

## Uma vez: sua chave de acesso

O acesso é por **chave**, não por senha. A chave privada nunca sai da sua
máquina, não há o que um bot adivinhe na porta 22, e o dia em que alguém sair
do projeto basta remover a chave daquela pessoa, sem mexer na de ninguém.

Na sua máquina:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/fateconnect -C "seu-nome"
```

⚠️ O `-f` não é opcional. Sem ele o comando mira em `~/.ssh/id_ed25519` e, se
já existir uma chave ali, sobrescrever invalida todo acesso que dependia dela.

Depois mande **só a chave pública** para quem administra o servidor:

```bash
cat ~/.ssh/fateconnect.pub
```

⛔ O arquivo sem `.pub` é a chave privada. Ela não sai da máquina — nem por
mensagem, nem por e-mail, nem em commit.

## No DBeaver

Nova conexão → **PostgreSQL**.

**Aba Main:**

| Campo    | Valor                          |
| -------- | ------------------------------ |
| Host     | `localhost`                    |
| Port     | `5432`                         |
| Database | `fateconnect_hml`              |
| Username | `fateconnect_hml`              |
| Password | a senha do banco (veja abaixo) |

**Aba SSH** — marque _Use SSH Tunnel_:

| Campo                 | Valor                                   |
| --------------------- | --------------------------------------- |
| Host/IP               | `fateconnect.com.br`                    |
| Port                  | `22`                                    |
| User Name             | o usuário da VPS                        |
| Authentication Method | `Public Key`                            |
| Private Key           | `~/.ssh/fateconnect` — **sem** o `.pub` |
| Passphrase            | a da chave, se você definiu uma         |

O `localhost` da aba Main não é engano. Quem conecta é a ponta do túnel, que
fica **dentro** do servidor — do ponto de vista do banco, a conexão nasce
local. Pôr o endereço da VPS ali é o erro mais comum, e o sintoma é timeout: a
conexão sai pela internet e bate no firewall.

## A senha do banco

Ela vive no `.env` do ambiente, na VPS, e é lida pela mesma conta que você usa
para entrar:

```bash
ssh -i ~/.ssh/fateconnect usuario@fateconnect.com.br \
  'grep "^POSTGRES_PASSWORD=" ~/FateConnect/deploy/.env.hml | cut -d= -f2-'
```

⛔ Não copie essa senha para dentro do repositório.

## Chave e senha são coisas diferentes

É aqui que todo mundo tropeça: **a chave abre o túnel** (aba SSH) e **a senha
abre o banco** (aba Main). A mensagem de erro diz qual das duas falhou.

| Mensagem                                                    | O que é                                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `Permission denied (publickey)`                             | sua chave não foi autorizada no servidor ainda                             |
| `Invalid privatekey` ou falha ao ler a chave                | o DBeaver está apontando para o `.pub`; aponte para o arquivo sem extensão |
| `password authentication failed for user "fateconnect_hml"` | túnel certo; errada é a senha **do banco**                                 |
| Timeout ao conectar                                         | endereço da VPS na aba Main, onde devia estar `localhost`                  |
| `Connection refused` na 5432 sem o túnel                    | é o firewall fazendo o trabalho dele                                       |

## Isolar o problema fora do DBeaver

Quando não der para dizer se o problema é o túnel ou o banco, suba o túnel na
mão e teste as camadas separadamente:

```bash
ssh -N -i ~/.ssh/fateconnect -L 55432:127.0.0.1:5432 usuario@fateconnect.com.br
```

Com ele de pé, em outro terminal:

```bash
nc -z 127.0.0.1 55432          # a porta local responde? o túnel está de pé
psql -h 127.0.0.1 -p 55432 -U fateconnect_hml -d fateconnect_hml
```

Se o `psql` pedir senha, o túnel está funcionando e o resto é credencial.

## O que você vai encontrar

O banco é compartilhado pelas duas APIs, então as tabelas das contas e as das
caronas convivem no mesmo lugar, junto da tabela de controle das migrations.
O schema é criado pelas migrations na subida da aplicação — não altere tabela
pelo DBeaver, ou o próximo deploy vai divergir do que o código espera.
