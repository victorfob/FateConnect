# Reaproveitar antes de criar

⛔ **Nunca duplicar código.** Antes de escrever componente, hook, util, helper, serviço ou constante, procurar na base o que já faz aquilo. Existindo, reaproveita-se o que existe. Parecido mas não igual, a saída é **propor unificar** — nunca uma segunda cópia.

## Procurar pelo comportamento, não pelo nome

É aqui que a busca falha. O `LostItemOwnerContact` nasceu cópia linha a linha do `RideDriverContact`: nomes diferentes, corpos idênticos, até as strings iguais. Procurar por "ContactButton" não acharia nada — procurar pelo que aquele comportamento **obriga a chamar** (`copyToClipboard`, `whatsappConversationUrl`, `getInitials`) achava o gêmeo no primeiro `Grep`.

Com `Grep` e `Glob`, buscar três coisas antes de criar arquivo:

- os utils e hooks que o código novo vai chamar;
- o componente do design system que ele vai montar (`Dialog`, `ContactDetails`);
- o texto de interface que ele vai exibir — rótulo repetido é duplicação anunciada.

## Encontrou duplicação: propor e perguntar

Vale também para duplicação **fora da tarefa**. Se eu vi, eu proponho na hora, sem esperar ser cobrado — a sugestão é obrigação, não favor. Trazer três coisas: o que está repetido, o que fica no lugar dos dois, e **onde** passa a morar. E **esperar o sim**.

⛔ **O destino nunca se decide sozinho.** As opções deste repo: `src/design-system/` (dois consumidores ou mais, e nada de `@app`), `src/components/` (compartilhado da aplicação, pode usar `@app`), `src/hooks/`, `src/utils/`, ou a pasta de quem usa quando o consumidor é **um só**. O critério está em `web-design-system.md` e `fateconnect-web-react.md` — e ele se reavalia quando o número de consumidores muda: unificar dois consumidores em um tira o componente do design system.
