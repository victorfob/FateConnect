---
name: ux-writing
description: "Escreve e revisa o texto de interface do FateConnect — rótulo, botão, aviso, título de diálogo, estado vazio, placeholder, mensagem de erro e copy de tela inteira. Use sempre que a tarefa envolver o texto que o usuário lê: revisar a copy de uma tela ou fluxo (inclusive a partir de uma captura), nomear um botão, escrever a mensagem de um aviso ou de um erro, checar consistência de termo entre telas, ou decidir entre duas formulações. As regras estão em .claude/rules/product-copy.md; esta skill é o procedimento de aplicá-las."
---

# UX writing

O padrão está na rule `.claude/rules/product-copy.md` — voz, aviso de sucesso, erro, botão, tooltip, estado vazio, caixa, verbos, data e número. **Leia a rule antes de propor qualquer texto**; aqui está só como conduzir o trabalho.

Postura: direta e construtiva. Sem elogiar o fluxo — aponte o que funciona e o que não funciona. Parceira de quem escreve o produto, não validadora.

## Quem lê

Estudante da faculdade, no celular ou no laptop, geralmente com pressa e no meio de outra coisa. Não é público técnico e não é cliente corporativo: o texto conversa, mas não é íntimo. As duas áreas com texto de produto hoje são caronas e achados e perdidos.

## Como conduzir

1. **Entenda a função da tela antes de sugerir.** O texto serve ao que a tela faz. Se a função não estiver clara, **pergunte** — copy escrita sobre suposição é retrabalho.
2. **Leia a rule e as telas vizinhas.** O termo que você vai usar já existe em algum lugar? Use o mesmo. Não invente sinônimo para estado que já tem nome.
3. **Varra o artefato inteiro, não elemento a elemento.** Antes de fechar:
   - **Naming:** o mesmo objeto se chama igual em rótulo, botão, título e aviso?
   - **Precisão:** o texto promete o que a tela entrega? Desconfie de "automático" onde a ação é manual.
   - **Paralelismo:** itens de lista e de menu na mesma forma gramatical.
   - **Só ouvido:** quem usa leitor de tela entende onde está e o que vem depois?
4. **Entregue em tabela Atual × Sugerido × Por quê**, com a justificativa em uma linha citando a regra aplicada. Havendo mais de uma opção defensável, mostre o trade-off em vez de escolher sozinho.
5. **Separe copy de produto.** Pergunta que trava a escrita — qual é o nome real da feature, o que o botão faz de fato, qual é a regra de negócio — vem **antes** e bloqueia a versão final. Fricção que o texto não resolve (um fluxo que exige três telas para uma ação simples) vira observação, não maquiagem.
6. **Ao receber captura de tela**, diga qual elemento está revisando antes de propor — "o botão do rodapé do diálogo", não "o botão".

## Antes de entregar

- Nenhum "com sucesso", "por favor" ou "!" em aviso de sistema.
- Nenhum termo alternando para a mesma coisa.
- Nenhum "você" em mensagem transacional; nenhuma frase que culpe quem lê.
- Erro com problema **e** saída.
- Botão no imperativo, verbo primeiro, sentence case.
- Copy em pt-BR, identificador em inglês.

## A régua pode não alcançar o texto

⛔ **Quando o texto é de um registro que a `product-copy.md` não cobre, a lacuna é da regra — e fechá-la vem antes de propor a copy.** Sugestão escrita contra uma régua que não alcança o caso é sugestão que ninguém consegue julgar: não há critério para aceitá-la nem para recusá-la.

Aconteceu na #227. A regra descreve texto transacional — aviso, botão, erro — e a landing vende. Propor a copy dela ali seria aplicar o critério errado, ou inventar um em silêncio.

**O caminho:** nomeie a lacuna, pesquise fonte externa que a fundamente, escreva a seção na `product-copy.md`, e só então proponha o texto. Seção e copy saem no **mesmo PR** — separadas, cada review se lê pela metade.

⚠️ **A pesquisa pode contrariar a intuição, e é para isso que ela serve.** Na landing a expectativa era que vender pedisse tom mais animado; a medição da Nielsen Norman Group diz o contrário — a versão objetiva de um mesmo site rendeu +27% de usabilidade, e +124% somada a concisão e escaneabilidade, porque hipérbole cobra atenção de quem lê e derruba credibilidade. Leve número e fonte para o corpo do PR: é o que permite discordar da sua sugestão com base em algo.

## Limites

- Mudar a **rule** de copy → editar `.claude/rules/product-copy.md`, e a mudança sai por PR como qualquer código.
- Implementar o texto no código → as constantes ficam na pasta do componente que as usa, conforme `.claude/rules/web-react-patterns.md`.
