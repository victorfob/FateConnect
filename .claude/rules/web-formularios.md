---
description: Formulários no front React — react-hook-form, zod, campos do MUI, máscara e estados
paths:
  - "FateConnect/Web/**"
---

# Formulários

Padrão estabelecido no cartão de login e válido para as telas de formulário (#54 em diante).

## Composição

- **`react-hook-form` + `zod`** via `@hookform/resolvers/zod`. O schema fica em `schema.ts`, ao lado do componente, junto das mensagens.
- Mensagens de validação são **copy de produto**: em pt-BR, iguais às do front atual, exportadas do schema para o teste não duplicar texto.
- `defaultValues` sempre declarado — evita campo alternando entre não-controlado e controlado.

## Campos

- `TextField` do barrel, com `error={Boolean(errors.campo)}` e `helperText={errors.campo?.message}`.
- Campo obrigatório recebe `required`, que rende o marcador `*` no rótulo — **isso muda o nome acessível** (`"E-mail *"`), então a consulta no teste usa expressão regular, não texto exato.
- `autoComplete` coerente com o campo; em senha, alternar entre `current-password` e `off` conforme a visibilidade.
- Ação dentro do campo vai em `InputAdornment` com `IconButton`, `aria-label` descrevendo a **ação** e `aria-pressed` comunicando o estado.

## Ícone reflete estado

O ícone mostra a situação atual, não o destino do clique: olho aberto quando o texto está visível. O rótulo acessível continua descrevendo a ação.

## Envio

- `useMutation` para o envio; `isPending` alimenta a prop **`loading` do `Button`**, que já desabilita e desenha o indicador. Sem rótulo alternativo ("Enviando...") e sem `disabled` manual — o rótulo do botão não muda.
- Erro tratado por status: o cliente HTTP normaliza a falha em `{ status, message }`, então o componente decide a mensagem a partir do `status`.
- Sucesso e falha comunicam por notificação (`useNotification`), nunca por `console`.

## Máscara

- Função pura + hook, **sem biblioteca de máscara**.
- Máscara de data precisa **preservar a posição do cursor** ao editar no meio do campo e ao colar. É requisito herdado do produto, não detalhe.
- Máscara alternativa por comprimento (telefone fixo e celular) é resolvida na função pura.

## Testes

Cobrir, no mínimo: mensagens de campo obrigatório, formato inválido, alternância de visibilidade (inclusive o ícone), sucesso, cada ramo de erro por status, e o estado de carregamento.

O caso de carregamento **segura a resposta numa promessa que o próprio teste resolve** — nunca `setTimeout`. Espera por tempo passa localmente e falha sob cobertura, quando a requisição termina antes da verificação. Com o botão em `loading`, o nome acessível continua o mesmo: asserir `toBeDisabled()` e o `progressbar` dentro dele. Schema tem teste próprio — ver `.claude/rules/web-testes-zod.md`.
