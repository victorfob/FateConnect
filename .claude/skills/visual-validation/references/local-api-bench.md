# Bancada local da API para evidência

Para a tela que depende de rota que ainda não está em homologação. Ela sobe a API da branch com banco e fila de verdade, e as capturas mostram dados fictícios.

## Serviços

```bash
docker run -d --name pg-<issue> -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=fateconnect -p 55<issue>:5432 postgres:17
docker run -d --name rabbit-<issue> -p 5672:5672 rabbitmq:4-alpine
```

- A série 3 do RabbitMQ sai na subida com `eacces` no `.erlang.cookie` no Docker Desktop; a 4 sobe.
- A API e o front sobem como servidores do painel (`preview_start`, configurados no `launch.json` local, que o git ignora), não por Bash.
  - API: `dotnet run --no-launch-profile --urls http://localhost:5011`, lendo um arquivo de variáveis fora do repositório.
  - Front: outra porta, com `VITE_API_URL` apontando para a API e o `CORS_ORIGINS` da API apontando para essa porta.
- As variáveis obrigatórias são as do `RequiredSettings`. Chave de terceiro leva valor falso, e o segredo do JWT é gerado na hora (`openssl rand -hex 32`) e nunca impresso.
- A API está pronta quando `/health` responde 200; ela aplica as migrations na subida.

## Dados

- As contas nascem pelo `POST /Users/signup`, e um `UPDATE "Users"` acerta o que o cadastro não dá: `IsEmailConfirmed`, `ProfileType` e o contato.
- As publicações vêm da própria API, com o token do `POST /Auth/login` de cada conta.
- Nome plausível, contato `@example.com`, telefone fictício: as capturas vão para o PR público.
- Estado difícil de produzir pela tela (aceite antigo, item envelhecido) se ajusta no banco, com `SELECT` antes e depois.

## Sessão

O token do login vai para o `localStorage` (`jwt_token`) **da porta da bancada**. Na 5173 ele apagaria a sessão de homologação de quem captura lá.

## Captura em densidade 2

Chrome headless pelo protocolo de depuração, com o `WebSocket` nativo do Node 24, sem dependência:

- `Emulation.setDeviceMetricsOverride` com `deviceScaleFactor: 2` (375×812 com `mobile: true`, ou 1280×800);
- navegue até a origem, grave o token com `Runtime.evaluate`, então navegue até a rota;
- os passos da tela são `Runtime.evaluate` (o Select do MUI abre com `mousedown` no `combobox`);
- `Page.captureScreenshot` em PNG.

⛔ URL montada com `${…}` entre aspas simples não interpola: o token cai noutra origem, e a tela volta deslogada sem erro nenhum. Leia o caminho e o `localStorage` antes de culpar a aplicação.

## O fluxo chega do outro lado

Com a fila de verdade, a evidência inclui o efeito gravado (o aviso na tabela, a ação registrada). A tela mostrar o sucesso não prova que o consumidor rodou.

## Desmontar

Servidores, contêineres, as entradas do `launch.json` e a pasta com o arquivo de variáveis e os tokens. Depois de o Docker Desktop reabrir, a lista de contêineres sai vazia enquanto ele ainda carrega o que tinha: ausência se confere de novo, alguns segundos depois.
