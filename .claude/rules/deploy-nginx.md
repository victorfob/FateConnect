---
description: Mudar a configuração do nginx — como provar a mudança antes de ela chegar na VPS, a precedência de location que rouba prefixo, e o que o certbot faz com o nosso bloco
paths:
  - "deploy/**"
---

# Configuração do nginx

O `deploy/README.md` é o runbook — como publicar e como operar. Aqui está o que vale ao **mudar** o `site.conf.template`.

## Prove antes de chegar na VPS

⛔ **Ler a configuração não prova o que ela faz.** Precedência de `location`, herança de diretiva e ordem de `try_files` decidem o comportamento, e nenhuma delas se enxerga no texto. Suba um nginx **da mesma versão do host** e meça.

```bash
docker run -d --name prova -p 8091:8091 \
  -v "<conf renderizada>:/etc/nginx/conf.d/default.conf:ro" \
  -v "<raiz falsa do front>:/www:ro" nginx:<versão do host>
```

**A bancada tem três lados, e o terceiro é o que dá sentido aos outros:**

| | O que prova |
| --- | --- |
| o template novo, renderizado em **cada** ambiente | que o comportamento pedido acontece |
| o template que está **no ar** hoje, lado a lado | que ele era diferente — sem isso o "depois" não é resultado |
| um **mutante** do template novo | que a linha que você acrescentou é carregadora, e não decoração |

⚠️ **Renderize com o mesmo `sed` do `install-site.sh`** e confira que nenhuma marca `__X__` sobrou. Marca esquecida vira caminho literal, e o nginx aceita sem reclamar.

⚠️ **O `nginx -t` só responde sobre sintaxe.** Ele aprova uma configuração que serve a coisa errada — o que discrimina é o `curl` em cada caminho, lendo status, `Content-Type` e os cabeçalhos que você espera.

## Depois de instalar, o transporte se confere de dentro

⛔ **Medição feita de fora atravessa tudo que estiver no caminho, e o que ela descreve pode ser o caminho, não o servidor.** Vale para o que é negociado na conexão — versão do protocolo, TLS, tamanho comprimido.

```bash
ssh <host> 'curl -sk --http2 -o /dev/null -D - \
  --resolve <dominio>:443:127.0.0.1 https://<dominio>/'
```

Medido em 12/09/2026, logo depois de instalar o `http2 on;` em homologação: de fora a mesma rota respondeu `HTTP/1.1` e de dentro `ALPN: server accepted h2`. A diretiva estava certa; a leitura é que não era do servidor.

⚠️ **Status, corpo e `Content-Type` atravessam intactos** — esses se conferem de qualquer lugar. É só o transporte que precisa do loopback.

## ⛔ Regex vence prefixo, e o prefixo perde calado

⛔ **Ao acrescentar um `location ~`, todo `location /prefixo/` do arquivo passa a correr risco.** A ordem do nginx é: `=` exato, depois `^~`, depois **regex**, e só então o prefixo mais longo. Um prefixo simples perde para qualquer regex que case o mesmo caminho.

⛔ Aconteceu na #384, ao fazer caminho com extensão responder 404. A regra nova casava `.js`, e os dois prefixos do arquivo eram simples. A mutação mediu o estrago:

| | Com `^~` | Sem |
| --- | --- | --- |
| `/assets/*.js` | `Cache-Control: immutable` | **o cabeçalho some** — desfazendo a #360 |
| `/api/x.json` | **502**, foi ao proxy | **404**, o proxy é ignorado |

**O sintoma é o pior possível: o status continua 200.** O arquivo é servido, a página funciona, e o que se perde é um cabeçalho — invisível em qualquer teste que olhe só o corpo.

**A saída é `^~` no prefixo que precisa ganhar**, e o mutante é o que prova que ele está fazendo trabalho.

## O certbot altera o **nosso** bloco, não cria outro

Medido em 12/09/2026 na configuração instalada: o plugin do nginx tira o `listen 80` do bloco que o template descreve, acrescenta ali o `listen 443`, o certificado e o `include` do TLS, e cria um **segundo** bloco só com o redirecionamento de 80 para 443.

⚠️ **A consequência decide onde a diretiva mora:** o que estiver no bloco do template acaba **dentro do servidor HTTPS**. Foi assim que `http2 on;` coube no template em vez de precisar de um arquivo à parte, e a renovação não o desfaz porque ela não reescreve o bloco.

⚠️ **E o `install-site.sh` sobrescreve o arquivo inteiro**, então ele reaplica o certbot logo depois. Diretiva escrita à mão em `/etc/nginx/` desaparece na primeira execução — o lugar dela é o template.

## O que o robô lê não mora na raiz do front

⛔ **`rsync --delete` apaga o que estiver dentro da raiz** a cada publicação. Arquivo servido pelo nginx que não vem do build — `robots.txt`, `sitemap.xml` — fica fora dela, e o `install-site.sh` o instala por ambiente.

⚠️ **A diferença entre ambientes sai da presença do arquivo, não de um condicional.** O template é um só: ele aponta o caminho, e o ambiente que não tem aquele arquivo responde 404 sozinho.
