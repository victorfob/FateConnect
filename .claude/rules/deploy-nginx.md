---
description: Mudar ou instalar a configuração do nginx — provar antes da VPS, o template que não se instala sozinho, a precedência de location que rouba prefixo, o formato de log do host sem IP inteiro nem query, o que o certbot faz com o nosso bloco, e o `install-site.sh` por `sudo`
paths:
  - "deploy/nginx/**"
  - "deploy/install-site.sh"
  - "deploy/README.md"
---

# Configuração do nginx

O `deploy/README.md` é o runbook. Aqui está o que vale ao **mudar** o `site.conf.template` ou instalá-lo.

## Prove antes de chegar na VPS

⛔ Ler a configuração não prova o que ela faz: suba um nginx **da mesma versão do host** e meça.

```bash
docker run -d --name prova -p 8091:8091 \
  -v "<conf renderizada>:/etc/nginx/conf.d/default.conf:ro" \
  -v "<raiz falsa do front>:/www:ro" nginx:<versão do host>
```

- A bancada tem três lados: o template novo renderizado em **cada** ambiente, o template que está no ar lado a lado, e um **mutante** do novo, que prova que a linha acrescentada carrega peso.
- Renderize com o mesmo `sed` do `install-site.sh` e confira que nenhuma marca `__X__` sobrou.
- `nginx -t` só vê sintaxe: meça com `curl` cada caminho, lendo status, `Content-Type` e cabeçalhos.

## ⛔ O template no repo não é o que está no ar

- Nada instala o template: o `deploy.sh` publica o front, e o `install-site.sh` é passo manual. A configuração antiga segue respondendo 200.
- "Está atualizado" não se mede; a diretiva, sim. Procure a linha esperada no arquivo **instalado**:

```bash
ssh <host> 'grep -c "<a diretiva nova>" /etc/nginx/sites-available/fateconnect-{prod,hml}'
```

## O transporte se confere de dentro

Protocolo, TLS e compressão se conferem pelo loopback; status, corpo e `Content-Type`, de qualquer lugar.

```bash
ssh <host> 'curl -sk --http2 -o /dev/null -D - \
  --resolve <dominio>:443:127.0.0.1 https://<dominio>/'
```

⚠️ O controle vem no mesmo comando: o emissor do certificado. Diferente do esperado ⇒ há intermediário terminando a conexão, e o transporte medido é o dele. Controle contra outros sites prova o instrumento, não este caminho.

## ⛔ Regex vence prefixo, e o prefixo perde calado

Acrescentou um `location ~`? Todo `location /prefixo/` que precisa ganhar leva `^~`, e o mutante prova. O sintoma é o status seguir 200 e sumir um cabeçalho, ou o proxy ser ignorado.

## ⛔ Dois sites, um nginx

Homologação e produção instalam o mesmo template no mesmo nginx, e por isso o template não declara nada no contexto `http`. O formato de log mora no `nginx/host-log.conf` (`fateconnect_masked`), instalado uma vez por host **antes** dos sites, e o `install-site.sh` para sem ele. Diretiva de `http` nova vai para lá, com nome único: `log_format` repetido reprova o `nginx -t`, e `map` repetido passa calado, valendo o do último arquivo lido. A bancada carrega os dois sites juntos.

## ⛔ O log de acesso não guarda a query

- O caminho sai do `$request_uri` cortado no `?`: depois do `try_files`, o `$uri` vira `/index.html`.
- O `Referer` também sai sem a query, porque a página devolve o token dos links de e-mail no pedido seguinte.
- Dois `access_log` no mesmo nível gravam os dois arquivos: o do `nginx.conf` fica comentado (`vps-setup.sh`).

## certbot e `install-site.sh`

- O certbot altera o **nosso** bloco (tira o `listen 80`, põe o 443 e o certificado) e cria outro só para o redirecionamento: diretiva escrita no template acaba no servidor HTTPS.
- O `install-site.sh` sobrescreve o arquivo e reaplica o certbot: edição à mão em `/etc/nginx/` some na próxima execução.
- `robots.txt` e `sitemap.xml` ficam fora da raiz do front, porque o `rsync --delete` a limpa; o script os instala por ambiente, e a diferença entre ambientes sai da presença do arquivo, não de condicional.

## ⛔ `install-site.sh` por `sudo`, nunca de dentro de um shell de root

Ele decide a posse da pasta do front por `SUDO_USER` (`chown -R "${SUDO_USER:-root}"…`). Aberto por `sudo su`, a pasta fica `root:root`, o script sai verde, e a **próxima publicação** falha. O `~` apontando para `/root` denuncia a sessão errada. Confira depois:

```bash
ls -ld /var/www/fateconnect /var/www/fateconnect/<ambiente>   # dono = o usuário do deploy
```

Já dentro de um shell de root, o usuário vai explícito: `SUDO_USER=<usuário do deploy> ./install-site.sh <ambiente>`, com a mesma conferência.
