---
description: Copy de interface — o gatilho da skill ux-writing, o glossário decidido e as proibições de uma linha
paths:
  - "FateConnect/Web/src/**/constants/**"
  - "FateConnect/Web/design-system/**/constants/**"
  - "FateConnect/Web/src/**/schema/**"
  - "FateConnect/Web/src/**/helpers/**"
  - "FateConnect/Web/src/routes/pageMetadata.ts"
  - "FateConnect/Web/legal/**"
---

# Copy de produto

⛔ Texto que a pessoa lê, novo ou alterado, passa pela skill `ux-writing` antes do commit, e as candidatas vão ao dono. A régua completa (voz, landing, título de documento, diálogo, estado vazio, largura) está em `.claude/skills/ux-writing/references/copy-guide.md`.

## Glossário decidido

- O estado é `Resolvido` na etiqueta, no filtro e no aviso. A ação de chegar nele fala por tipo: `encontrado` para quem perdeu, `devolvido` para quem achou.
- ⛔ Achados e perdidos diz `Arquivar` (reversível, `Desfazer` no aviso) e caronas diz `Excluir` (sem volta, mantém o diálogo de confirmação). Não é inconsistência a corrigir.
- A denúncia é `Sigilosa`, não `Anônima`: a identidade é registrada e escondida por perfil.
- ⛔ Carona que se repete tem `recorrência` em todo texto (`Recorrência`, *data final da recorrência*); nunca *repetição* nem *frequência*. Os identificadores (`frequency`, `EnumRideFrequency`) ficam como estão.
- `Criar conta`, não `Cadastre-se`; `Meu perfil`, não `Perfil`.
- A busca diz tudo o que alcança: `Destino ou descrição` em caronas, `Nome ou descrição` em achados e perdidos, com `?busca=`. O `Destino` do formulário de ofertar é outro campo.
- Valor de enum não é rótulo (`Solidarity` aparece como **Solidária**): procure o mapa em `helpers/` antes de escrever o valor em copy, URL ou issue.
- A ajuda do campo (`helpText`) diz para que o campo serve, em frase curta com ponto final. Campo que existe para uma funcionalidade planejada descreve o uso final dela; a exceção vale só para a ajuda do campo, e a funcionalidade que falta fica registrada numa issue e no corpo do PR.

## Proibições

- Aviso sem "com sucesso", "por favor" e "!": particípio e ponto (`Carona ofertada.`).
- Erro diz o problema e a saída, sem código de servidor e sem culpar quem lê.
- Botão: verbo primeiro, até três palavras, sentence case (maiúscula só na primeira palavra, como em aba, título e cabeçalho de seção).
- Sem `—` na copy do produto nem nos documentos legais. O `UNKNOWN_LABEL = '—'` dos `helpers/` é símbolo de célula vazia e fica.
- Mensagem transacional voltada ao fato, sem "você" (`Item excluído`).
- Número com dígito e zero à esquerda; data `dd/MM/yyyy`; hora `07:30`; intervalo `07:00 - 09:00`.
