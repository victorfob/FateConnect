---
description: Render de teste com providers centralizados no test-utils do projeto
paths:
  - "FateConnect/Web/**"
---

# Testes — providers

## Regra

- Usar sempre o `render` de **`src/test/testing-library.tsx`**, nunca o `render` importado direto do `@testing-library/react`.
- Esse módulo empacota os providers da aplicação — tema, roteador, cache de dados — e reexporta a Testing Library inteira, além do `userEvent`.
- **Não** reenvolver os mesmos providers arquivo a arquivo. Provider novo entra no `test-utils` e passa a valer para toda a suíte de uma vez.
- Provider **específico de um caso** (ex.: um roteador em memória com rotas artificiais para exercitar um hook) pode ser montado no próprio teste — o que não se duplica é o conjunto padrão.

## Hooks que dependem de contexto

Testar via um componente mínimo que consome o hook e renderizar com o `render` do `test-utils`, ou usar o `renderHook` do `@testing-library/react` com o wrapper apropriado. **Nunca** o pacote `@testing-library/react-hooks`, que é do React 17 e está descontinuado.
