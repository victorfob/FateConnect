---
description: Formulários no front — campo e prop de erro, valor lido pelo consumidor, anúncio ao leitor de tela, seletor de data e hora, máscara e envio
paths:
  - "FateConnect/Web/src/pages/**/*Form*/**"
  - "FateConnect/Web/src/pages/Signup/**"
  - "FateConnect/Web/src/pages/Home/components/LandingLoginCard/**"
  - "FateConnect/Web/design-system/components/Input/**"
  - "FateConnect/Web/design-system/components/FormGrid/**"
  - "FateConnect/Web/design-system/components/Dialog/DialogForm/**"
  - "FateConnect/Web/src/hooks/useMaskedField.ts"
  - "FateConnect/Web/src/utils/masks/**"
  - "FateConnect/Web/src/**/schema/**"
---

# Formulários

## Campos

- Schema em `schema/index.ts` na pasta do formulário; mensagens de validação são copy e saem de constante que o teste também importa.
- ⛔ O mesmo campo em duas telas leva a mesma ajuda: o texto mora ao lado das opções do campo (`RIDE_TYPE_HELP` junto de `RIDE_TYPE_OPTIONS`, em `pages/Rides/helpers/rideType.ts`). Ao dar ajuda a um campo, procure pelas opções dele as outras telas que o montam.
- Campo é o `Input` do barrel com `error={errors.campo?.message}`. `required` põe `*` no nome acessível (`"E-mail *"`): no teste, a consulta usa regex.
- Ação dentro do campo é `IconButton` com `aria-label` da ação e `aria-pressed` do estado; o ícone mostra o estado atual (olho aberto com o texto visível). Senha alterna `autoComplete` entre `current-password` e `off`.
- ⛔ Formulário com senha tem um campo `autocomplete="username"`, oculto quando o login não se edita: o Chrome ignora campo desabilitado e preenche com o login o campo anterior à senha ao abrir a tela.
- ⛔ Com esse campo, o gerenciador preenche a senha atual ao abrir a tela. Ela sozinha não é alteração nem cobra a nova: quem pede a troca é a nova senha (`pages/Profile/helpers/pendingChanges.ts`).
- ⛔ Campo com sugestão (`Input.Autocomplete`) tem dois painéis do Chrome por cima: o histórico do campo, que o `off` padrão desliga, e os endereços salvos, que ignoram o `off` em campo que o Chrome toma por endereço (o *Bairro*). Ali vai `addressLike`, um valor que ele não reconhece e que devolve o histórico: nenhum valor desliga os dois.
- ⛔ Campo que ganha a primeira regra de validação ganha a prop de erro junto: sem ela o schema recusa e a tela fica muda. O teste de schema não vê isso; o caso é de componente.
- ⛔ Quem lê o valor de campo registrado é o consumidor, por `useWatch`, e passa ao `Input` (`characterCount={description.length}`). O `Input` não relê o elemento: o `reset()` escreve sem evento, e a releitura pediria um efeito sem dependências que o lint reprova.
- ⛔ `role="status"` é irmão do campo, nunca dentro da linha de apoio: ela é o `aria-describedby`, e o anúncio seria ouvido de novo a cada foco.

## Seletor de data e hora

- ⛔ O seletor do MUI só chama `onChange` quando o valor muda: clicar no valor já marcado não dispara nada. Comportamento que dependa desse clique escuta o clique no painel e reconhece a coluna pelo rótulo de `usePickerTranslations`, não pela posição.
- O `onAccept` do seletor estático não é saída: só dispara com `closeOnSelect` (que ele não aceita) ou pela barra de ações (que o campo esconde).

## Máscara e envio

- Máscara de data preserva a posição do cursor ao editar no meio e ao colar; máscara alternativa por comprimento (fixo e celular) se resolve na função pura.
- `isPending` vai na prop `loading` do `Button`, que já desabilita e desenha o indicador: sem rótulo alternativo e sem `disabled` manual. A mensagem de erro se decide pelo `status` que o cliente HTTP normaliza.
- ⛔ O 409 com `field` (e-mail ou telefone já em uso) se marca no campo, com foco, em todo formulário que envia o campo (`conflictFieldOf`); o aviso genérico fica para o resto. Campo que muda de tela leva esse tratamento junto.
- Teste de formulário cobre obrigatório, formato inválido, alternância de visibilidade (com o ícone), sucesso, cada ramo de erro por status e o carregamento. O carregamento segura a resposta numa promessa que o teste resolve, nunca `setTimeout`, e afirma `toBeDisabled()` e o `progressbar` dentro do botão.
