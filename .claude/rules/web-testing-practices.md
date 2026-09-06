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

## Suíte verde não prova que ela pega o defeito

⛔ **Quebre o código de propósito e confira que o teste cai.** É a única forma de saber se ele testa o que o nome dele diz — e o caso clássico aqui não é o teste frouxo, é o teste que **alimenta o formato errado**.

Aconteceu em 04/09/2026, na #309. A regra de partida futura do formulário de carona nunca disparava: o campo guarda `22/05/2026` e ela lia com `parseISO`, que só entende ISO. O teste passava verde porque montava a entrada com o formato da **API** — ele passaria igual com a regra apagada. Quatro mutações fecharam a rodada, cada uma derrubando o teste escrito para ela: voltar o `parseISO`, tirar a conversão de fuso, tirar um `.max()` do schema e tirar a prop de erro de um campo.

**Restaure a árvore ao fim de cada mutação** e confirme com `git status` que nada sobrou.

## O fuso do processo vem fixado, e a linha de comando não o vence

⛔ **`vitest.setup.ts` executa `process.env.TZ = 'America/Sao_Paulo'` para toda a suíte.** Rodar `TZ=UTC npx vitest` **não muda nada**: o setup roda depois e sobrescreve.

Isso importa porque o fuso do produto é exatamente onde uma comparação feita no relógio local e uma feita no fuso do produto **concordam** — nenhum teste as distingue enquanto o processo estiver ali. Na #309 o controle rodou `TZ=UTC` na linha de comando, a suíte passou 9/9 com a conversão de fuso removida, e a conclusão natural teria sido que a conversão era desnecessária.

Para discriminar, troque a variável **dentro do caso** e restaure ao fim — medido, funciona a partir da atribuição:

```ts
process.env.TZ = 'UTC';
// … a asserção que só passa lendo o fuso do produto
process.env.TZ = PRODUCT_TIME_ZONE;
```

⚠️ **O sinal é o controle passar quando você esperava que falhasse.** Antes de concluir que o código sob mutação é desnecessário, pergunte se o cenário chega a alcançá-lo.

## O nome no `getByRole` sai da constante, nunca do texto

⛔ **Nunca escreva o rótulo literal — nem string, nem regex — para achar um controle.** Importe a constante que o componente usa. Copy muda, e o literal não muda junto: ou o teste quebra, ou — pior — passa a casar **outro** controle.

⛔ Aconteceu na #227. O teste dispensava um diálogo com `getByRole('button', { name: /Cancelar/ })`. Quando o glossário renomeou a ação destrutiva de `Excluir` para `Cancelar`, o mesmo regex passou a casar o botão que **cancela o item** — o teste executou justamente a ação que ele existia para não executar, e só denunciou porque o cartão sumiu da tela depois.

**A regex é o caso mais perigoso**, porque ela sobrevive à mudança em vez de quebrar. `/Cancelar/` continuou achando um botão; só não era o mesmo botão.

⚠️ **Um literal no meio de constantes é o sinal.** No mesmo PR, `routeConfig.test.tsx` importava quatro títulos de tela como constante e escrevia o quinto na mão — dos cinco, foi o único que quebrou.

## Asserção de ausência precisa provar que consegue falhar

⛔ **`expect(queryBy…).not.toBeInTheDocument()` passa quando o elemento nunca existiu, quando a consulta está errada e quando o componente sequer renderizou.** Os três parecem iguais no verde.

Antes de escrever a negativa, monte o **positivo** com a mesma consulta e confirme que ele encontra alguma coisa.

Na #227, o critério era "o login não mostra aviso nenhum". Todo aviso do produto traz um botão `OK` para dispensar, então a asserção virou `queryByRole('button', { name: 'OK' })` na negativa — mas só depois de eu acrescentar a **positiva** ao caso de erro ao lado e ver que ela encontra o botão. Sem esse passo, a negativa passaria para sempre, inclusive se o aviso voltasse com outro rótulo.

⛔ **E a negativa se ancora no lugar, não no texto que você espera encontrar.** Provar que a consulta acha alguma coisa não basta quando ela procura **a frase**: qualquer outro conteúdo naquele espaço passa por baixo dela.

Na #310 o critério era "sem motivo, o cartão não mostra nota". Duas versões passaram com o defeito reposto de propósito:

| Asserção | Escapou de |
| --- | --- |
| `queryByText(NOTA.manual)` e `queryByText(NOTA.inatividade)` | nota de reserva com qualquer outra redação |
| contar quantas vezes a palavra `Excluído` aparece no cartão | nota que não repete a palavra da etiqueta |

A terceira funcionou porque afirma **o que vem logo depois da descrição**: havendo nota, é a nota; não havendo, é o botão de ação. Aí qualquer texto naquele espaço derruba o caso.

**O tell é a asserção nomear o conteúdo que não deve existir.** Se você consegue escrever a frase proibida, está testando aquela frase — não a ausência.

## Corpo de requisição se afirma inteiro

⛔ **`toMatchObject` é subconjunto: chave a mais passa calada.** Para o payload que sai para a API, `toEqual` — ele reprova o que sobra, que é justamente o risco.

Na #213 a troca revelou que o cadastro envia `complement` como string vazia, coisa que nenhum teste afirmava. E é ela que impede `acceptTerms` e `acceptMarketing` de vazarem: os dois são do formulário, a API não os recebe, e o `toMatchObject` aceitaria os dois sem reclamar.
