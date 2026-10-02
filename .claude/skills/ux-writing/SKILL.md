---
name: ux-writing
description: "Escreve e revisa o texto de interface do FateConnect — rótulo, botão, aviso, título de diálogo, estado vazio, placeholder, mensagem de erro, título de página e copy de tela inteira ou de documento legal. Use sempre que a tarefa envolver o texto que o usuário lê, inclusive quando ele nasce no meio de outra tarefa, sem pedido: revisar a copy de uma tela ou fluxo (também a partir de uma captura), nomear um botão, escrever um aviso ou um erro, checar consistência de termo entre telas, ou decidir entre duas formulações."
---

# UX writing

## Paradas

1. ⛔ **O gatilho é a copy existir, não alguém pedir.** Texto novo ou alterado no meio de outra tarefa passa por aqui antes do commit, mesmo quando parece óbvio por seguir as vizinhas — é aí que ele entra sem ninguém decidir. Vale para a frase que o dono propõe: a tabela da régua vai à vista sobre ela também.
2. ⛔ **Havendo mais de uma candidata defensável, ofereça as frases inteiras e deixe a escolha ao dono.** Medição não substitui a oferta; quanto mais medição, mais a escolha parece decidida pelos números. Se ele não recusou uma alternativa, a escolha é sua e se anuncia como sua — nunca "pela skill".

Postura: direta e construtiva, parceira de quem escreve o produto, não validadora. Quem lê o produto: estudante da faculdade, no celular ou no laptop, com pressa e no meio de outra coisa.

## Como conduzir

1. **Entenda a função da tela.** Não estando clara, pergunte: copy sobre suposição é retrabalho.
2. **Leia `references/copy-guide.md`, a rule `product-copy.md` e as telas vizinhas.** O termo já existe? Use o mesmo.
3. **Varra o artefato inteiro:** naming (o mesmo objeto igual em rótulo, botão, título e aviso), precisão (o texto promete o que a tela entrega), paralelismo, e se funciona só ouvido.
   - ⛔ A varredura cobre a palavra que **a sua** sugestão introduz: antes de propor um verbo, `grep` pelo verbo e pelos sinônimos; achando outro nome em uso para a mesma ação (`Criar conta` contra `Cadastre-se`), o seu não entra.
4. **Meça o que carrega dado** no contêiner real (skill `visual-validation`) e leve o número junto.
5. **Entregue em tabela Atual × Sugerido × Por quê**, cada candidata como a frase inteira que vai para a tela, não só o pedaço que muda. A medição vai junto (tamanho, largura, do que cada uma abre mão).
6. **Separe copy de produto.** Pergunta que trava a escrita (nome real da feature, o que o botão faz, regra de negócio) vem antes e bloqueia a versão final; fricção que o texto não resolve vira observação.
7. **Com captura de tela**, diga qual elemento está revisando ("o botão do rodapé do diálogo").

## A régua pode não alcançar o texto

⛔ Texto de um registro que a régua não cobre: a lacuna é da régua, e fechá-la vem antes da copy. Nomeie a lacuna, pesquise fonte externa, escreva a seção em `references/copy-guide.md` e só então proponha o texto — seção e copy no mesmo PR, com número e fonte no corpo dele.

## Limites

- Mudar a régua → `references/copy-guide.md`; o glossário e as proibições → a rule `product-copy.md`. Sai por PR como qualquer código.
- O texto no código mora nas constantes da pasta do componente que o usa (`web-react-patterns.md`).
