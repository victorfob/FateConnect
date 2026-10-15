---
description: Testes do front com Vitest e Testing Library — render com providers, mocks, cobertura por arquivo, e as armadilhas do jsdom e das asserções que não conseguem falhar
paths:
  - "FateConnect/Web/**/*.test.{ts,tsx}"
  - "FateConnect/Web/src/test/**"
  - "FateConnect/Web/vitest.setup.ts"
---

# Testes do front

## Montagem

- `render`, `renderHook` e `userEvent` vêm de `@app/test/testing-library`, que monta os providers da aplicação. Provider novo entra lá; provider específico de um caso (um roteador em memória com rotas artificiais) pode ser montado no teste. Nunca `@testing-library/react-hooks`.
- Sem import de `vitest`: os globals estão ligados e o `Mock` é global (`src/test/vitest-globals.d.ts`). Só `Mock<Fn>` com genérico importa o tipo.
- Mock de módulo se tipa com `as Mock`, nunca `as unknown as ReturnType<…>` nem `any`; `as unknown as T` só para fixture.
- `vi.clearAllMocks()`/`vi.restoreAllMocks()` no `afterEach`, nunca no `beforeEach`. `vi.fn()` com `mockResolvedValueOnce` nasce dentro do `beforeEach`. Sobrescrita num `it` é `mockReturnValueOnce`. `vi.useFakeTimers()` e `vi.stubGlobal` sempre em par com a restauração no `afterEach`.
- O nome no `getByRole` sai da constante que o componente usa, nunca de literal ou regex: a regex sobrevive à mudança de copy e passa a casar outro controle.

## Gate

- ⛔ `yarn test:ci` verde não prova a cobertura do seu arquivo: a média da base segura o global, e o Sonar mede código novo por PR. Antes do push, leia `LF`/`LH` e `BRF`/`BRH` de cada arquivo do diff em `coverage/lcov.info`. Os limites estão no `vite.config.ts`.
- ⛔ Troca de rota ou de URL exige a suíte inteira: o stub velho vive no teste que você não abriu e reprova por console (`msw` sem handler + `vitest-fail-on-console`), não por asserção.

## Tempo do teste

- ⛔ No CI o teste roda umas três vezes mais devagar que aqui e oscila quase o dobro entre rodadas: passou de metade do limite, uma subida de dependência o estoura, e o seguinte reprova pelo `act` que sobrou.
- Texto que só preenche campo vai por `userEvent.click` + `userEvent.paste`; `type` só quando a tecla é o assunto (sugestão a cada letra, máscara aos poucos).
- Jornada por vários filtros troca o filtro pela URL (`act(() => router.navigate(…))`, roteador do `renderAtRoute`) quando a troca pela interface tem teste próprio.
- Meça com `--reporter=verbose` antes de mudar; o que não cai (seletores do MUI) fica.

## jsdom

- Geometria é zero: componente que mede `getBoundingClientRect`/`offsetWidth` sai pelo `if` de guarda. Forje com `vi.spyOn` e `Object.defineProperty`, desfeitos no `afterEach`.
- ⛔ Não há `matchMedia`, e `useMediaQuery` responde o ramo estreito com a janela a 1024px: o caso do ramo largo passa medindo o estreito. Stub com `matches` e os três métodos de escuta, `vi.unstubAllGlobals()` no `afterEach` — exemplo em `FateConnect/Web/design-system/components/Pagination/Pagination.test.tsx`.
- ⛔ O `getComputedStyle` ignora `@media`, estado e pseudo-elemento: estilo de uma largura, o `:hover` e o `::before` se afirmam lendo a folha do Emotion pelo `src/test/utils/styleSheetRules.ts` (`narrowDeclarationsFor`, `declarationsFor`). Não escreva outra leitura no teste.
- Não há `ResizeObserver` (o `vitest.setup.ts` põe um vazio). O falso do teste dispara só o que passou por `observe`; o que dispara sempre deixa a mutação "tirar a observação" passar. Altura de texto recolhido se forja com `src/test/utils/contentHeight.ts`.
- O `index.html` não é carregado, e o `<head>` do teste só tem o que o componente escreveu. Asserção que depende do `<head>` real lê o arquivo; asserção que pega "o primeiro" de algo é o sinal — conte antes.
- ⛔ O relógio falso só dispara o que já está agendado: `setTimeout` que o efeito reagenda a cada render anda um passo por `act`, e o teste de "libera depois de um minuto" fica parado no primeiro segundo. Contagem regressiva é `setInterval` enquanto corre (`src/hooks/useCountdown.ts`).
- `vitest.setup.ts` fixa `TZ` no fuso do produto, e `TZ=UTC` na linha de comando não vence. Para discriminar fuso, troque `process.env.TZ` dentro do caso e restaure.

## Asserção que não consegue falhar

- ⛔ Quebre o código de propósito e veja o teste cair. Em arquivo que a branch altera, não restaure com `git checkout --`: ele apaga a sua mudança, e o `git status` limpo é o alarme. Mutação que reprova por `TS6133` (import órfão) não foi testada; refaça tirando o órfão.
- ⛔ O caso que a mudança não deve tocar se afirma nas duas larguras (`declarationsFor` e `narrowDeclarationsFor`): conferido só no largo, o botão único do `PageMessage` esticou no estreito com o teste verde.
- O teste alimenta o formato que o código recebe de verdade (o do campo, não o da API).
- Valor esperado que é o mesmo símbolo que a implementação importa não testa nada: afirme a propriedade que o consumidor exige (`new URL(href)` sem base), não o valor.
- ⛔ Negativa (`not.toBeInTheDocument()`) só depois da positiva com a mesma consulta, e ancorada no lugar — o que vem logo depois —, não no texto proibido.
- Corpo de requisição se afirma com `toEqual`: `toMatchObject` deixa chave a mais passar.
