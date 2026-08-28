---
description: Termos de uso e política de privacidade — onde vivem, quando precisam ser atualizados e por que a data de versão não pode ficar para trás
paths:
  - "FateConnect/Web/legal/**"
  - "FateConnect/Web/src/services/**"
  - "FateConnect/Web/src/pages/**/schema/**"
  - "FateConnect/Web/src/observability/**"
  - "FateConnect/**/Domain/Entities/**"
  - "FateConnect/FateConnect.Api/Modules/**"
---

# Termos de uso e política de privacidade

| | |
| --- | --- |
| Fonte do texto | `FateConnect/Web/legal/termos.html` e `privacidade.html` |
| O que a aplicação serve | `FateConnect/Web/public/termos.pdf` e `privacidade.pdf` |
| Como o PDF nasce | `FateConnect/Web/legal/build-pdfs.sh` (Chrome headless) |
| Data de versão | `FateConnect/Web/src/constants/legalDocuments.ts` |

⛔ **Nunca edite o PDF.** Ele é gerado. Edite o HTML e rode o script — binário não se revisa, e um documento jurídico cuja alteração ninguém consegue ler no diff é pior que documento nenhum.

## A obrigação que se esquece: funcionalidade nova envelhece o documento

⛔ **Ao acrescentar ou mudar um fluxo de dado pessoal, releia os dois documentos e conserte o que passou a ser falso.** Ninguém avisa quando eles desatualizam: nenhum teste quebra, nenhum lint acusa, e o texto continua ali afirmando com confiança algo que deixou de ser verdade.

Conta como fluxo novo, e portanto obriga a releitura:

- **campo novo no cadastro ou em qualquer formulário** — a política lista o que se coleta, nominalmente;
- **entidade nova ou campo novo que persista dado de pessoa**;
- **integração com terceiro** — provedor, serviço de consulta, telemetria: a política nomeia cada um e diz o que sai;
- **dado novo exibido para outros usuários** — há uma seção inteira sobre o que fica visível;
- **funcionalidade que muda o que a plataforma faz** — os termos descrevem caronas e achados e perdidos; denúncia, notificação e administração ainda **não** estão descritas.

## Mudou o texto? A data de versão sobe junto

⛔ **Alterar o HTML e não mexer em `legalDocuments.ts` quebra o registro de aceite.** A constante de versão é o que o cadastro grava para dizer **qual texto** a pessoa aceitou. Sem subir a data, o aceite passa a apontar para um documento que não existe mais — e o registro perde justamente a serventia que o justifica.

Ao mudar o texto: edite o HTML, suba a data nos dois lugares (no `<header>` e no rodapé do HTML, e na constante), e rode `build-pdfs.sh`.

## O que os documentos hoje declaram

Serve para conferir rápido se algo que você acrescentou já está coberto:

- coleta do cadastro, campo a campo, e o que o uso gera (caronas e itens);
- **IP e identificação do navegador** no registro do aceite;
- **Sentry** com replay de sessão — 10% das sessões e 100% das que dão erro, com texto mascarado e mídia bloqueada, sem dado de usuário e sem corpo de requisição;
- **`localStorage`** com token, nome e preferência de tema;
- **consulta de CEP** enviando o CEP a serviço externo;
- o que fica visível para outros usuários, prazos de guarda, e os direitos do Art. 18 da LGPD.

⚠️ **O texto não passou por revisão jurídica.** Ele é verdadeiro sobre o que o código faz — que é o que dá para garantir daqui —, e continua pendente de revisão por quem tenha competência para isso.
