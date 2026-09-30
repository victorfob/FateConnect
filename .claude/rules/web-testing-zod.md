---
description: Teste de schema Zod no front — contrato por campo, caminho do erro e a exceção da mensagem
paths:
  - "FateConnect/Web/**/schema/**"
---

# Teste de schema Zod

- Teste ao lado do schema, sobre o contrato, não sobre o Zod: `schema.safeParse(entrada)`, afirmando `success` e, na falha, o caminho do erro (`issues[0].path`), não a mensagem.
- ⚠️ Exceção: campo com duas regras e duas mensagens afirma caminho **e** mensagem, pela constante que o schema usa — senão o teste passa com as duas trocadas.
- Por campo: valor válido nos limites, ausência quando obrigatório, formato inválido quando há formato, e opcional ausente sem erro.
- Uma fixture válida no topo, sobrescrevendo só o campo sob teste em cada caso.
