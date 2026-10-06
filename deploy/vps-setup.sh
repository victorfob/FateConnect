#!/usr/bin/env bash
# Prepara a VPS para receber o FateConnect. Roda UMA vez, com sudo:
#
#   sudo ./vps-setup.sh
#
# Faz cinco coisas, todas conferíveis antes de executar:
#   1. instala PostgreSQL, nginx, certbot e fail2ban;
#   2. instala o Docker;
#   3. fecha a porta do banco para a internet com firewall;
#   4. permite que os contêineres alcancem o Postgres do host;
#   5. cria um banco e um usuário por ambiente.
#
# Não desliga nenhum serviço que já estava na máquina.
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Rode com sudo: sudo ./vps-setup.sh" >&2
  exit 1
fi

TARGET_USER="${SUDO_USER:-$(logname 2>/dev/null || echo root)}"
PG_CONF_DIR=/etc/postgresql/17/main
PG_HBA="$PG_CONF_DIR/pg_hba.conf"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "==> 1/5 Pacotes do host"
apt-get update -qq
# O git entra aqui e não antes por um motivo prático: sem ele não há como
# clonar o repositório que contém este script, então ele chega por outro meio
# e instala o próprio pré-requisito.
# O rsync é como a pipeline entrega o front construído no runner.
# O PostgreSQL é o 17 do Debian 13, e o caminho de PG_CONF_DIR depende disso.
apt-get install -y -qq git curl ca-certificates rsync \
  postgresql nginx certbot python3-certbot-nginx fail2ban
echo "    git $(git --version | awk '{print $3}'), $(psql --version), $(nginx -v 2>&1)"

echo "==> 2/5 Docker"
if command -v docker >/dev/null 2>&1; then
  echo "    já instalado: $(docker --version)"
else
  curl -fsSL --proto '=https' --tlsv1.2 https://get.docker.com | sh
fi
usermod -aG docker "$TARGET_USER"
echo "    $TARGET_USER adicionado ao grupo docker (vale no próximo login)"

echo "==> 3/5 Firewall"
# O banco escuta em todas as interfaces para os contêineres o alcançarem. Quem
# impede o acesso de fora é o firewall — sem ele, a 5432 fica aberta na
# internet, que é como bancos de teste são invadidos.
if ! command -v ufw >/dev/null 2>&1; then
  apt-get install -y -qq ufw
fi
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp    comment 'SSH'      >/dev/null
ufw allow 80/tcp    comment 'HTTP'     >/dev/null
ufw allow 443/tcp   comment 'HTTPS'    >/dev/null
# Os contêineres alcançam o banco pelo gateway do Docker, e essa conexão entra
# pela interface docker0 — ou seja, é "incoming" e cai no deny padrão. Liberar
# a faixa privada do Docker é o que a autoriza sem abrir a porta para fora.
ufw allow from 172.16.0.0/12 to any port 5432 proto tcp comment 'Postgres para contêineres' >/dev/null
ufw --force enable >/dev/null
echo "    liberadas 22, 80 e 443; a 5432 só para os contêineres"

echo "==> 4/5 Acesso dos contêineres ao Postgres"
cp -a "$PG_HBA" "$PG_HBA.bak-$TIMESTAMP"
# As faixas privadas cobrem as redes que o Docker cria. A internet não chega
# aqui porque o firewall barra antes.
for range in 172.16.0.0/12 192.168.0.0/16 10.0.0.0/8; do
  if ! grep -q "$range" "$PG_HBA"; then
    echo "host    all    all    $range    scram-sha-256" >> "$PG_HBA"
  fi
done
# O contêiner chega pelo gateway do docker0, que não é localhost para o
# Postgres: escutando só em localhost, as APIs sobem e não conectam.
PG_CONF="$PG_CONF_DIR/postgresql.conf"
cp -a "$PG_CONF" "$PG_CONF.bak-$TIMESTAMP"
sed -i "s/^#\?listen_addresses = .*/listen_addresses = '*'/" "$PG_CONF"
systemctl restart postgresql
echo "    pg_hba.conf e listen_addresses ajustados (backups com sufixo .bak-$TIMESTAMP)"

echo "==> 5/5 Bancos dos dois ambientes"
for environment in hml prod; do
  database="fateconnect_$environment"
  username="fateconnect_$environment"
  password=$(openssl rand -base64 24 | tr -d '/+=')

  # `sudo -u` e não `su -`: o usuário postgres costuma ter /sbin/nologin como
  # shell, e aí o `su` falha sem conseguir sequer abrir a sessão.
  exists=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$database'")
  if [[ "$exists" = "1" ]]; then
    echo "    $database já existe; senha não alterada"
    continue
  fi

  sudo -u postgres psql -q -c "CREATE USER $username WITH PASSWORD '$password';"
  sudo -u postgres psql -q -c "CREATE DATABASE $database OWNER $username;"
  echo "$password" > "/root/password-$database.txt"
  chmod 600 "/root/password-$database.txt"
  echo "    $database criado; senha em /root/password-$database.txt"
done

echo
echo "Pronto. Confira o firewall com:  sudo ufw status numbered"
echo "E o banco escutando para os contêineres:  ss -tlnp | grep 5432"
