---
name: prove-the-mechanism
description: "Receitas de medição e controle positivo por instrumento. Use antes de relatar zero, ausência, passou, risco residual ou CI verde; ao esperar ou resumir os checks de um PR; ao escrever script que reescreve texto ou dado; ao conferir se uma branch está contida noutra antes de apagá-la; ao medir no navegador, cache ou rede; ao atribuir um efeito a uma mudança ou remover um contorno."
---

# Prove o mecanismo

A regra está na `conduct.md` (seção "Prove o mecanismo") e vale no fechamento. Aqui ficam as receitas: abra a referência do instrumento que vai sustentar a conclusão.

| Vai concluir a partir de | Abra |
| --- | --- |
| `grep`, `git diff`, contagem, saída de comando | `references/busca-e-saida.md` |
| `gh pr checks`, `gh run view`, artefato de CI, suíte que o CI pulou | `references/ci-e-checks.md` |
| script que reescreve arquivo, tabela de substituição, `UPDATE`, mutação | `references/transformacao.md` |
| `git branch -d`, "está tudo na `main`", diff entre branches | `references/git-contencao.md` |
| controle que passou, efeito atribuído à mudança, contorno a remover, troca de token | `references/controle-e-atribuicao.md` |
| medição no navegador: pseudo-classe, requisição, cache | `references/navegador.md` |

Layout e largura: skill `visual-validation`. Transporte do nginx: `deploy-nginx.md`. Memória de processo na API: `dotnet-testing.md`.

## A pergunta que abre qualquer receita

1. Qual é a pré-condição exata da falha que eu temo? Costuma estar na mensagem de erro.
2. Ela chega a existir aqui — medido, não deduzido?
3. Com o defeito forçado de propósito, este instrumento acusa?

Diga a frase que descreve o instrumento, não a que descreve o que você queria saber: "a regra vencedora é a nossa" não é "medi o preenchimento automático".
