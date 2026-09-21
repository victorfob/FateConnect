---
description: Onde está cada parte do repositório FateConnect
---

# FateConnect — contexto do repositório

- **Front:** `FateConnect/Web` — React + Vite, MUI + Emotion, design system local em `design-system/`, fora de `src` (barrels `@design-system` e `@design-system/icons`), variáveis em `.env*` (`VITE_*`). Padrões: **`.claude/rules/fateconnect-web-react.md`**.
- **Idioma:** `.claude/rules/fateconnect-locale-code.md` — UI e URLs em pt-BR; código TypeScript e estrutura em inglês; domínio **Ride** no código.
- **API (.NET 8):** [FateConnect/FateConnect.Api](FateConnect/FateConnect.Api) — uma só, em módulos por domínio (`Auth`, `Common`, `Denunciations`, `LostAndFound`, `Rides`, `Users`), com o projeto de teste em `FateConnect.Api.Tests`, pasta **irmã** e não filha. ⛔ **Módulo listado não é módulo implementado** — algum deles pode ser só um arquivo vazio marcando o lugar. Não assuma entidade, endpoint nem serviço sem código correspondente; quem separa os dois casos é a pasta, não esta lista:

  ```bash
  find FateConnect/FateConnect.Api/Modules -name '*.cs' -size 0
  ```
- **Não existe tela de contato.** O contato é **seção da landing** — âncora `#contato`, atendida pelo rodapé. Não há rota `/contato`: ela não está no `RoutePathEnum` nem no `routeConfig`, e um link antigo cai no curinga que leva à landing. Ao mexer em `constants/navigation.ts` ou nas rotas, não "restaurar" nem o item de menu nem a rota.
