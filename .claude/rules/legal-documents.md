---
description: Termos de uso e política de privacidade — onde vivem, como auditar o texto contra o código, e a data de versão que sobe junto
paths:
  - "FateConnect/Web/legal/**"
  - "FateConnect/Web/src/constants/legalDocuments.ts"
---

# Termos de uso e política de privacidade

| | |
| --- | --- |
| Fonte do texto | `FateConnect/Web/legal/termos.html` e `privacidade.html` |
| O que a aplicação serve | `FateConnect/Web/public/termos.pdf` e `privacidade.pdf` |
| Como o PDF nasce | `FateConnect/Web/legal/build-pdfs.sh` (Chrome headless) |
| Data de versão | `FateConnect/Web/src/constants/legalDocuments.ts` |

⛔ Nunca edite o PDF: edite o HTML e rode o script.

## Auditar: afirmação por afirmação

Reler confirma o que você já acredita. Cada afirmação se confere contra uma medição:

| A afirmação | A medição |
| --- | --- |
| campos coletados | o que o mapper de fato envia |
| o que fica no navegador | as chaves dos dois armazenamentos na página **publicada** — o SDK de terceiro grava sem passar pelo nosso código, e o `grep` por `setItem` não o vê |
| cada terceiro nomeado | o que o código realmente chama |
| cada prazo de guarda | o que apaga de verdade |
| o vocabulário | um documento contra o outro: a contradição entre os dois só aparece lendo os dois sobre o mesmo assunto |

- Busca por ausência leva controle positivo (a mesma busca encontrando um termo que está lá).
- O texto descreve o produto final: afirmação sobre funcionalidade planejada se confere contra a issue aberta que a entrega, não contra o código. O tell é a divergência cair num fluxo sem endpoint.

## Mudou o texto? A versão sobe junto

- ⛔ A constante de versão é o que o cadastro grava como texto aceito. Mudou o HTML: suba a data no `<header>`, no rodapé e na constante, e rode `build-pdfs.sh`.
- Suba só a do documento que mudou (`PRIVACY_VERSION` ou `TERMS_VERSION`).
- Versão que ainda não está numa tag publicada pode receber texto sem mudar de data; a que já está, nunca.
- Versão que sobe leva a limpeza do arquivo inteiro (travessão, régua de copy), não só das linhas que você tocou.
- ⛔ O script regera os dois PDFs. Devolva com `git checkout --` só o PDF do documento que **não mudou nesta branch**: o do que mudou voltaria ao texto antigo.
- Confira o texto do PDF, não o carimbo, com controle positivo. Sem `pdftotext`, o PDFKit do macOS lê o texto (`PDFDocument(url:).string` num script Swift).
