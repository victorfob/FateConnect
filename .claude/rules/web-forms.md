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

⛔ **Campo que ganha a primeira regra de validação precisa ganhar a prop de erro junto.** Enquanto ele não tem regra, ninguém sente falta da ligação — e no dia em que a regra entra, o schema recusa e a **tela fica muda**: o envio trava e nada explica por quê.

Aconteceu na #309, no `Complemento` do endereço. Ele era o único campo opcional e sem limite, então nasceu sem `error={errors.complement?.message}`. O limite de comprimento entrou e o formulário passou a recusar em silêncio. ⚠️ **O teste de schema não vê isso** — o schema estava certo; quem não exibia era o campo. Quem pegou foi a medição na aplicação, e o caso que protege agora é de componente, não de schema.

### O valor do campo não controlado é do formulário, e quem o lê é o consumidor

⛔ **O `Input` não sabe o que está escrito num campo registrado.** O `register` do `react-hook-form` guarda o valor no elemento, e o `reset()` escreve ali sem disparar evento e sem mudar prop. Precisando do valor — para contar, para decidir —, quem lê é o consumidor, pelo `useWatch`, e passa o resultado ao componente. É o caminho que a biblioteca documenta.

⛔ Decidido pelo Victor em 25/09/2026, no #461, depois de medir a alternativa. O `Input` consegue contar sozinho, somando o `onChange` a uma releitura do elemento a cada render: os testes de edição passaram, e sem a releitura eles caíram. Mas a releitura exige um `useLayoutEffect` **sem lista de dependências** — não há dependência a declarar, porque nada muda além do elemento —, e o `react-hooks/exhaustive-deps` reprova isso. Afrouxar o lint para um caso só foi descartado.

**Por isso o contador recebe `characterCount={description.length}`** nos três consumidores, lido com `useWatch`.

### Anúncio para o leitor de tela não mora na linha de apoio

⛔ **A linha de apoio é a descrição acessível do campo.** O MUI a liga ao campo pelo `aria-describedby`, então tudo que estiver ali é lido junto do rótulo sempre que o campo recebe foco. Um elemento com `role="status"` colocado dentro dela passa a ser ouvido duas vezes: quando anuncia, e de novo no foco, colado no erro.

Aconteceu na #434. A contagem anunciada morava dentro da linha, então a descrição do campo levava o erro e a contagem juntos, sem separador no DOM. **A decisão do Victor foi estrutural:** o `status` virou irmão do campo, e a linha ficou só com o erro e o contador visível, que tem `aria-hidden`. Medido a 375px: a descrição do campo passou a ser só o erro, e o `status` absoluto não abriu vão na coluna.

⚠️ **No jsdom a descrição sai colada, e isso não diz como o navegador a monta.** O jsdom junta os textos dos filhos sem separador. No Chrome, os três `span` saíam com `display: block`, porque eram itens de flex, e o navegador tende a separar filhos de bloco com espaço. Mas **a descrição computada não foi lida**: este Chrome não expõe a API. Mover o `status` para fora resolveu sem depender de nenhuma das duas leituras.

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

O caso de carregamento **segura a resposta numa promessa que o próprio teste resolve** — nunca `setTimeout`. Espera por tempo passa localmente e falha sob cobertura, quando a requisição termina antes da verificação. Com o botão em `loading`, o nome acessível continua o mesmo: asserir `toBeDisabled()` e o `progressbar` dentro dele. Schema tem teste próprio — ver `.claude/rules/web-testing-zod.md`.
