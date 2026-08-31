---
description: Risco residual não é entregável — evidência estatística é gatilho de procurar o mecanismo, e o zero de uma sonda só vale com controle positivo
---

# Prove o mecanismo, não a frequência

⛔ **Evidência estatística não é resultado para relatar — é ordem de ir atrás do mecanismo.** "Rodei 5 vezes e passou" responde *com que frequência*; a pergunta era *pode acontecer*. Só a segunda fecha o assunto.

**O gatilho é a frase que você está prestes a escrever:** *"é evidência, não prova"*, *"rodei N vezes e passou"*, *"aqui não reproduz"*, *"deve ser raro"*. Nenhuma é conclusão. Todas são o momento de responder duas coisas:

1. **Qual é a pré-condição exata da falha que eu temo?** Ela costuma estar escrita na mensagem de erro dela.
2. **Essa pré-condição chega a existir aqui — medido, não deduzido?**

Provada a impossibilidade, o risco acabou e o número vira nota de rodapé. Não provada, o resíduo é real e relatá-lo é o certo — dizendo **o que já foi descartado** e o que resolveria.

⛔ Aconteceu na #237. Fechei a entrega listando um risco em aberto — 24 fábricas de teste criando banco ao mesmo tempo, *"5 corridas verdes, é evidência, não prova"* — e pedi confirmação para commitar. A devolução do Victor foi *"ué se é risco oq podemos fazer pra não ter risco?"*. Não havia risco, e o mecanismo levou três minutos: a falha temida exige sessão aberta no `template1`, e o `template1` recebe **zero** conexões na corrida real. Pergunta categórica tratada como estatística.

⚠️ **A ressalva honesta é o disfarce.** *"É evidência, não prova"* soa como rigor — soa melhor que "não consigo explicar" —, e é justamente por isso que a parada passa despercebida. O teste não é se a frase é verdadeira: é se ela **transfere a dúvida** para quem lê.

## O zero só vale com controle positivo

⛔ **Antes de relatar que a falha não aconteceu, force-a a acontecer.** Sonda incapaz de produzir o defeito de propósito não mede a ausência dele — mede nada, e devolve verde.

Duas na mesma #237: `DOCKER_HOST` apontando para porta morta não desligou o Docker, porque o Testcontainers cai para o socket do Desktop e a suíte passa igual; e a guarda que eu escrevi para o caso "sem Docker" **nunca era exibida**, porque a exceção nasce em outro método. As duas só apareceram parando o Docker de verdade.

⚠️ **Desligar por variável de ambiente não é desligar.** Ferramenta com descoberta automática de endpoint — Docker, proxy, DNS, resolvedor de pacote — trata a variável como preferência, não como ordem. Para medir a ausência, tire o recurso do ar.

## O instrumento que alcança metade

⛔ **Sonda, regra e correção nascem cobrindo uma forma, e a resposta está na outra.** Não basta que o instrumento funcione: ele precisa alcançar **onde o problema mora**. Três vezes na #242, cada uma de um jeito:

| O instrumento | O que ele alcançava | Onde a resposta estava |
| --- | --- | --- |
| `grep ... \| head` procurando quem mexia no scroll | as 10 primeiras linhas | na 11ª — e eu **descartei a hipótese certa** por causa disso |
| a regra `no-restricted-syntax` de tag crua | chamadas de `styled('nav')` | no JSX: três `<li>` passaram no código novo |
| a correção da fileira de paginação | a ponta inicial, onde a página 4 quebrava | na ponta final, onde a 9 quebrava igual |

⚠️ **`| head` num `grep` de investigação é o pior dos três**, porque some com a evidência sem avisar e a saída parece completa. Em busca que vai sustentar conclusão, conte antes (`grep -c`) ou não trunque.

⛔ **Regra nova se prova nas duas formas.** O controle positivo de uma regra de lint não é só "reprova o que deve" — é também "aceita o que deve". Ao estender a de tag crua, rodei um arquivo com `<div>` **e** `<strong>` no mesmo JSX: o primeiro reprova, o segundo passa. Sem a segunda metade eu teria proibido ênfase de texto sem perceber.

⛔ **Correção com duas pontas se confere nas duas, enumerando.** Consertei a página 4 e entreguei; a 9 tinha o defeito espelhado e quem viu foi o Victor. O que resolveu foi listar **todos** os estados de 1 a 12 numa tabela e olhar a coluna inteira — as duas faixas usavam medidas diferentes, e isso só aparece lado a lado.

## O que esta rule não é

Não é ordem de esgotar toda dúvida antes de abrir a boca. Ela vale no **fechamento** — ao dizer "pronto", abrir PR ou pedir confirmação. No meio do trabalho, resíduo em aberto é normal, e dizer que está em aberto é o certo.
