---
description: Práticas de teste no front React — mocks, ciclo de vida, AAA e estrutura do arquivo de teste
paths:
  - "FateConnect/Web/**"
---

# Testes — práticas

Complementa a seção de testes de `.claude/rules/fateconnect-web-react.md`, que define runner, queries, nomenclatura e cobertura mínima.

## Checklist de mocks — reler antes de escrever qualquer teste

- `vi.clearAllMocks()` / `vi.restoreAllMocks()` → **sempre em `afterEach`**, nunca em `beforeEach`. Limpar na entrada apaga o que o setup do próprio caso preparou.
- Instância de `vi.fn()` usada com `mockResolvedValueOnce` / `mockReturnValueOnce` → **declarar dentro do `beforeEach`**, para cada caso receber uma instância limpa.
- Sobrescrita pontual dentro de um `it` → **`mockReturnValueOnce`**, nunca um segundo `mockReturnValue` (que vaza para os casos seguintes).
- Cast de mock de módulo → **`as Mock`**, sem importar nada. Nunca `as unknown as ReturnType<typeof …>` e nunca `any`.

## Nada de importar do `vitest`

⛔ **Arquivo de teste não importa de `vitest` — nem valor nem tipo.** Não existe `import { describe, it, expect, vi } from 'vitest'` nem `import type { Mock } from 'vitest'`. Um teste novo começa direto no `describe`.

Por que funciona: `globals: true` no `vite.config.ts` e `types: ["vitest/globals"]` no `tsconfig` deixam `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`, `beforeAll` e `afterAll` disponíveis sem import. O `vitest/globals` declara só **valores**, então o tipo `Mock` é declarado como global do repo em `src/test/vitest-globals.d.ts` — o cast é `as Mock`, sem import.

Única exceção: `Mock<Fn>` **com argumento de tipo**. A genérica não é repassada na declaração global porque as restrições dela (`Procedure`, `Constructable`) não são exportadas por `vitest`; quem precisar dessa forma importa o tipo naquele arquivo.

O import saía de graça em 48 arquivos e ninguém percebia porque o teste passava do mesmo jeito — é ruído que só some se a regra for categórica.

## Estrutura

- **AAA** — Arrange, Act, Assert. Uma linha em branco separando os três blocos deixa o caso legível sem comentário.
- Ordem do arquivo: imports → mocks de módulo → `describe` → hooks de ciclo de vida **dentro** do `describe` → casos.
- Asserts sobre o mesmo comportamento podem ficar num `it` só; não quebrar um caso por assert.

## Ciclo de vida

- `beforeEach`: prepara mocks e dados do cenário.
- `afterEach`: limpa mocks e efeitos globais (spies em `Element.prototype`, listeners, timers).
- Timer falso: `vi.useFakeTimers()` no `beforeEach` exige `vi.useRealTimers()` no `afterEach`, sempre em par.

## O que não fazer

- Não testar detalhe de implementação: nada de asserção sobre estado interno, nome de classe CSS ou ordem de chamada de hook.
- Não duplicar no teste a lógica que ele verifica — valor esperado é literal, não recalculado.
