---
description: Onde está cada parte do repositório FateConnect
---

# FateConnect — contexto do repositório

- **Front:** `FateConnect/Web` — React + Vite, MUI + Emotion, design system local em `design-system/`, fora de `src` (barrels `@design-system` e `@design-system/icons`), variáveis em `.env*` (`VITE_*`). Padrões: **`.claude/rules/fateconnect-web-react.md`**.
- **Idioma:** `.claude/rules/fateconnect-locale-code.md` — UI e URLs em pt-BR; código TypeScript e estrutura em inglês; domínio **Ride** no código.
- **API (.NET 8):** [FateConnect/FateConnect.Api](FateConnect/FateConnect.Api) — uma só, em módulos por domínio (`Achados`, `Auth`, `Common`, `Denuncias`, `Rides`, `Usuarios`), com o projeto de teste em `FateConnect.Api.Tests`, pasta **irmã** e não filha. `Achados` e `Denuncias` têm só a entidade — não assumir endpoint nem serviço sem código correspondente.
- **Não existe tela de contato.** O contato é **seção da landing** — âncora `#contato`, atendida pelo rodapé. Não há rota `/contato`: ela não está no `RoutePathEnum` nem no `routeConfig`, e um link antigo cai no curinga que leva à landing. Ao mexer em `constants/navigation.ts` ou nas rotas, não "restaurar" nem o item de menu nem a rota.
