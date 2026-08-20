---
description: Testes declarativos de schema Zod no front React
paths:
  - "FateConnect/Web/**"
---

# Testes de schema Zod

Vale a partir da tela de cadastro (#54), primeira a ter schema de validação.

## Estrutura

- Um arquivo de teste por schema, ao lado dele.
- Verificar o **contrato**, não a biblioteca: para cada campo, um caso válido e os casos inválidos que a regra de negócio prevê.
- Usar `schema.safeParse(entrada)` e asserir `success`; em falha, asserir o **caminho** do erro (`issues[0].path`), não a mensagem exata — mensagem é copy e muda.

## Casos obrigatórios por campo

- Valor válido no limite (menor e maior aceitos, quando houver limite).
- Ausência, quando o campo é obrigatório.
- Formato inválido, quando há formato (e-mail, data, telefone).
- Campo opcional: ausência **não** pode gerar erro.

## O que não fazer

- Não testar que o Zod rejeita tipo errado de dado — isso é a biblioteca, não o nosso contrato.
- Não montar o objeto de entrada inteiro em cada caso: uma fixture válida no topo e sobrescrita do campo sob teste por caso.
