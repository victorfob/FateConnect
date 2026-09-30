# Medir o pacote do front

O build local mede outro mundo se o ambiente for diferente do publicado.

- ⛔ **Toda medição de tamanho roda com as variáveis do ambiente de verdade**, nem que seja um valor de fachada. Sem `VITE_SENTRY_DSN`, o `initSentry` sai pelo `if (!dsn) return`, o Vite inlina a variável ausente como `undefined` e o bundler poda o SDK inteiro (16 kB contra 286 kB). Vale para qualquer `if (!variável) return` no caminho de um pacote pesado.
- O controle é comparar com o publicado: `ls -l` dos `assets/*.js` no servidor contra a saída do build.
- ⛔ **`import()` de um módulo que o código também importa estaticamente não separa nada**: resolve para a mesma instância e o bundler funde de volta. O alvo do `import()` é um módulo nosso alcançável só por ele, que importa o pesado — é o papel de `FateConnect/Web/src/observability/sessionReplay.ts`.
- A ordem dos grupos do `codeSplitting` no `vite.config.ts` decide quem fica com os módulos compartilhados; o motivo está no comentário do grupo `sentry`.
- ⛔ **A conferência é quem está no `index.html`, não o tamanho do pedaço**: pedaço separado e pré-carregado não economiza nada.

  ```bash
  grep -oE 'href="/assets/[^"]*\.js"' dist/index.html
  ```

  Procurar o pedaço ausente nessa lista responde zero por vacuidade quando ele nem foi criado: confira que ele **existe** em `dist/assets/` e que **não** está no `index.html`.
