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

## Reler não audita: cada afirmação se confere contra o código

⛔ **A releitura confirma o que você já acredita.** O documento foi escrito por alguém que conhecia o produto, então cada frase soa plausível — e continua soando depois de deixar de ser verdade. O que encontra o falso é comparar **afirmação por afirmação** com uma medição.

Em 21/09/2026, atualizando os documentos para o módulo de denúncias, esse método achou **quatro** afirmações falsas que nenhuma releitura tinha pego, e nenhuma delas estava no escopo daquela issue:

| Onde | Dizia | Era |
| --- | --- | --- |
| `termos.html` §6 | item sem movimentação é `cancelado` e **deixa de aparecer** | é `arquivado` e **segue visível** — a política já dizia o contrário, no mesmo repositório |
| `privacidade.html` §7 | guarda no navegador o token **e o nome** | só o token; o nome viaja dentro dele, na claim |
| `privacidade.html` §7 | ao sair, remove o token **e o nome** | remove o token |
| `privacidade.html` §2.1 | lista os campos do cadastro | faltavam as preferências de contato, recém-entregues |

**O que medir, e contra o quê:**

| A afirmação | A medição |
| --- | --- |
| a lista de campos do cadastro | o que o mapper de fato envia |
| o que fica no navegador | `grep` por `setItem` no código |
| cada terceiro nomeado | o que o código realmente chama |
| cada prazo de guarda | o que apaga de verdade |
| o vocabulário dos dois documentos | um contra o outro |

⚠️ **Busca por ausência precisa de controle positivo.** "A política não cita denúncia" só valeu porque a mesma busca encontrou `carona` quatro vezes. Sem o par, o zero pode ser do instrumento.

⚠️ **A contradição entre os dois documentos é a mais fácil de não ver**, porque cada um, lido sozinho, é coerente. Ela só aparece lendo os dois sobre o mesmo assunto.

## Mudou o texto? A data de versão sobe junto

⛔ **Alterar o HTML e não mexer em `legalDocuments.ts` quebra o registro de aceite.** A constante de versão é o que o cadastro grava para dizer **qual texto** a pessoa aceitou. Sem subir a data, o aceite passa a apontar para um documento que não existe mais — e o registro perde justamente a serventia que o justifica.

Ao mudar o texto: edite o HTML, suba a data nos dois lugares (no `<header>` e no rodapé do HTML, e na constante), e rode `build-pdfs.sh`.

⚠️ **E suba a data só do documento que mudou.** Mexendo na política, `PRIVACY_VERSION` sobe e `TERMS_VERSION` fica — versão que anda sem o texto ter andado faz o aceite apontar para uma revisão que não existiu.

⚠️ **O `build-pdfs.sh` gera os dois PDFs, inclusive o do documento que você não tocou.** O carimbo de geração muda, então o `git status` acusa os dois e o diff carrega um binário sem uma linha de conteúdo diferente. Devolva o que não mudou antes de commitar — medido em 11/09/2026, ao corrigir só a política:

```bash
git checkout -- FateConnect/Web/public/termos.pdf
```

## O que os documentos hoje declaram

Serve para conferir rápido se algo que você acrescentou já está coberto:

- coleta do cadastro, campo a campo, e o que o uso gera (caronas e itens);
- **IP e identificação do navegador** no registro do aceite;
- **Sentry** com replay de sessão — 10% das sessões e 100% das que dão erro, com texto mascarado e mídia bloqueada, sem dado de usuário e sem corpo de requisição;
- **`localStorage`** com token, nome e preferência de tema;
- o que fica visível para outros usuários, prazos de guarda, e os direitos do Art. 18 da LGPD.

⚠️ **O texto não passou por revisão jurídica.** Ele é verdadeiro sobre o que o código faz — que é o que dá para garantir daqui —, e continua pendente de revisão por quem tenha competência para isso.
