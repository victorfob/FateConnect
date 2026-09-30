# Medição no navegador

## Pseudo-classe que não se força

`CSS.forcePseudoState` cobre `:hover`, `:focus`, `:active`, `:visited`, `:focus-within` e `:focus-visible`, e **não** cobre `:-webkit-autofill` (e credencial não se digita). Leia a cascata em vez do pixel: percorra `document.styleSheets` juntando as regras cujo `cssText` cita a pseudo-classe; a ordem de aplicação é a resposta. Relate como "qual regra vence", não como "medi o preenchimento".

## Requisição que não aconteceu

`performance.getEntriesByType('resource')` não enxerga requisição que falha na conexão: devolve zero no caso que não devia chamar e no que devia. Quem responde é o log de rede do navegador, que registra a tentativa com o motivo, e o par positivo — o caso que **deve** chamar — separa "não chamou" de "não medi".

## Cache

Sem `Cache-Control`, o navegador arbitra a validade em ~10% da idade do arquivo: recém-publicado revalida tudo, dias depois não revalida nada. A/B de cabeçalho segura a idade (`touch` nos arquivos) e usa duas portas com cache separado; sem isso os dois lados empatam e a conclusão sai "não muda nada".

## Transição congelada

Com o painel do navegador oculto a página não compõe quadros e `getComputedStyle` devolve o valor do estado anterior de uma transição. Ver a skill `visual-validation`, `references/measurement-pitfalls.md` §"O computado congelado ou velho".
