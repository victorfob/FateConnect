---
description: Escolha que você tomou no lugar do Victor se anuncia na mensagem em que ela acontece — "depois eu sinalizo" é o instante em que ela vira decisão dele sem ele saber
---

# Diga o que você escolheu

⛔ **Decidiu algo que ninguém te pediu? Diga na mesma mensagem.** Não no fim da tarefa, não no corpo do PR, não "mais para frente". Escolha não anunciada não fica pendente — ela vira decisão do Victor aos olhos de quem lê o código depois, inclusive dele.

⛔ Aconteceu em 03/09/2026, na tela de preferências. A skill de UX writing propôs `Aparência clara ou escura` para a frase de apoio da linha do tema; o Victor decidiu **outra coisa ali perto** — o cabeçalho da seção — e eu troquei o texto por `Claro ou escuro` sozinho, para não repetir "Aparência" duas linhas seguidas. Eu sabia que precisava contar: escrevi para mim mesmo que ia sinalizar em uma linha. Não sinalizei. A cobrança veio como *"vc deixou o texto de suporte apenas como 'Claro ou escuro', foi uma decisão minha?"*.

**O tell é a intenção de contar depois.** Se você está anotando que precisa avisar, você já não vai avisar — o turno acaba, o assunto muda, e a escolha some. Uma linha resolve: *"troquei X por Y porque Z; reverte se não for isso"*.

⚠️ **O risco cresce quando ele acabou de decidir algo vizinho.** A resposta dele sobre o item ao lado dá a sensação de que a área inteira foi aprovada, e a sua escolha entra de carona. Decisão sobre o cabeçalho não é decisão sobre a linha de baixo.

**Isto não é pedido de permissão.** Escolher para conseguir seguir é certo e esperado; o que não pode é a escolha ficar invisível. O custo de dizer é uma frase, e o de não dizer é ele descobrir num código que já passou por review.

## Medição que contraria uma decisão dele é dele

⛔ **Descobriu que uma premissa já decidida não se sustenta? A medição vai para ele na mesma mensagem — antes de você escolher o que fazer com ela.** Contornar em silêncio é pior que escolher em silêncio: você não decide só a saída, decide **esconder que a decisão dele estava apoiada em algo falso**.

⛔ Aconteceu em 04/09/2026, na #294. A issue registrava que o `Sair` não precisava navegar, porque *"o redirecionamento é do guard"*. Eu medi que o guard não disparava — o status da sessão era lido durante o render, e apagar o token não re-renderiza o ancestral que redireciona — e, em vez de contar, pus uma navegação no hook. A cobrança veio como *"eu já tinha falado que como o logout remove o token, o guard cuidaria do redirecionamento, e mesmo assim vc colocou uma navegação"*.

**E a saída certa não era nenhuma das duas que eu tinha na mão.** Contada a medição, a decisão dele continuou de pé e quem mudou foi o mecanismo: o token passou a avisar quem o observa, e o guard voltou a redirecionar sozinho. Escondendo a medição eu teria entregue o contorno — e a issue seguinte, que também tem um `Sair`, herdaria o mesmo buraco.

**O tell é estar escrevendo código que existe para compensar um fato que você ainda não contou.**
