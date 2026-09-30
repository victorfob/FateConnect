# Instrumento que reescreve

O que só mede erra devolvendo número torto; o que reescreve erra **apagando**, e o arquivo salvo não denuncia o que sumiu.

## Script que transforma texto

- **Conte entrada contra saída e aborte se divergir.** Resolvedor de conflito que atribui linha à seção pelo cabeçalho acima dela grava zero linhas quando o bloco não tem cabeçalho. Um `assert` troca a perda silenciosa por parada barulhenta.
- **Saída vazia onde devia haver enumeração** ("0 arquivos alterados", "nenhuma seção") é o instrumento dizendo que não entendeu a entrada, não sucesso.
- **Tabela de substituição confere que cada regra disparou.** Regra que nunca casa não reclama e deixa um trecho intacto no meio.
- **Ordem:** reescrita de frase inteira antes das trocas de token (a troca muda a frase e ela deixa de casar); entre tokens, do mais longo ao mais curto (`AgenteUsuario` não vira `AgenteUser`).

## `UPDATE` à mão

Escrever apaga o valor anterior e no banco não há diff. Antes: `SELECT` das colunas que o comando vai **escrever** (inclusive a que você acrescentou por conta própria, como `UpdatedAt`). No comando: `RETURNING` para conferir o número de linhas. Coluna que o pedido não nomeia fica de fora.

## Provar um verificador

- **Mutante que não difere do original não matou nada:** `cmp -s original mutante` antes de ler o veredito. `sed` com expressão inválida esvazia o arquivo, e o verificador reprova pelo motivo errado. Sintoma: todos morrem de primeira.
- **Regra nova se prova nas duas formas:** reprova o que deve (`<div>`) e aceita o que deve (`<strong>`) no mesmo arquivo.
- **Correção com duas pontas se confere nas duas, enumerando:** liste todos os estados (páginas 1 a 12) numa tabela e olhe a coluna inteira.
