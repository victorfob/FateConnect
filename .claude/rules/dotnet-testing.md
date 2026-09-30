---
description: Teste na API .NET — os 90% de cobertura acima do portão e como medi-los, onde o teste mora, o par positivo, costura de relógio, a suíte contra PostgreSQL de verdade, mutação que prova o teste e fixture plausível
paths:
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Teste na API .NET

## Cobertura de 90%

- ⛔ **Código novo sai com ≥90%**, acima do portão do Sonar de propósito: portão verde não é entrega.
- Medir é `./scripts/coverage-changed.sh` (base padrão `origin/develop`), **com o trabalho commitado**: ele cruza o relatório com o diff commitado. Se a contagem não bate com os arquivos que você mexeu, a medida está errada. Rode antes de dizer que acabou.
- Linha que não dá para cobrir se marca com `[ExcludeFromCodeCoverage]`; não se baixa o alvo. Cobertura baixa costuma acusar teste que falta.

## Onde o teste mora

- ⛔ Nunca no projeto da API: `PackageReference` não tem `devDependencies` e vai para a publicação.
- Uma pasta por domínio espelhando `Modules/` (e `Infrastructure/`), namespace igual à pasta, apoio compartilhado em `Fixtures/`, nada na raiz. O que atravessa módulos vai para onde mora o código que ele exercita (a política de autorização fica em `Auth/`).

## Forma

- `Método_Cenário_Comportamento`, em inglês. As fases se separam por linha em branco, sem rótulo (C# não leva comentário).
- Vários casos viram `[Theory]`, nunca laço dentro do teste.
- ⛔ **O par positivo é obrigatório.** Teste que só prova a recusa passa numa API que recusa tudo: a rota que responde 401 sem token responde 200 com token; validação que rejeita tem o caso que aceita; filtro que exclui, o que inclui.

## Estático precisa de costura

- Relógio via `TimeProvider`: o `MinimumAgeAttribute` o pede ao `ValidationContext`; no endpoint, a `ApiFactory.Clock` recebe um `FixedTimeProvider` ou um `MovableTimeProvider`, que anda entre duas requisições.
- ⛔ Onde não há costura, não escreva o teste que depende do relógio: `Ride.ValidateDepartureDateTime` compara com `DateTime.UtcNow` direto.
- A borda fica no teste de unidade com relógio fixo; o endpoint fica com um caso de folga larga, provando só a fiação. Data literal fixa envelhece calada.

## A suíte roda contra PostgreSQL de verdade

- A suíte precisa de Docker (`TestDatabase`, um `postgres:17` com um banco por fábrica) e não tem fallback: verde com teste pulado é falso verde.
- O `pre-push` roda a suíte e falha sem motivo; rode `dotnet test` direto para ver a primeira mensagem.
- Corrida muito acima dos ~15s de sempre é Docker frio, não código: rode a suíte direto uma vez antes de empurrar de novo. ⛔ `--no-verify` pula a suíte inteira e não é saída.
- ⛔ Não serialize a criação dos bancos nem desligue o paralelismo do xUnit: o `template1` não recebe conexão, e a falha clássica de `CREATE DATABASE` concorrente não acontece aqui.
- Teste que grava arquivo: `git status` depois da suíte. A `ApiFactory` já isola o webroot num temporário.

## Suíte verde não prova que ela pega o defeito

Quebre o código de propósito e confira que a suíte cai; restaure e confira com `git status`.

- ⛔ Se a build da mutação falha, `dotnet test --no-build` roda a DLL anterior e tudo passa: confira o exit da build antes de ler o teste. Escreva `--verbosity quiet` por extenso: wrapper de shell que reescreve argumentos pode ficar com o `-v q`, e o build responde `Project file does not exist`.
- Mute o corpo do predicado, não a chamada: tirar o `.Where(Predicado())` deixa o método sem uso, e o analisador reprova antes de qualquer teste.
- ⛔ Medindo memória: `Process.PeakWorkingSet64` responde 0 no macOS, e medir no processo que gerou a carga põe a carga no "antes". Separe em processos: um gera o arquivo, outro só o processa sob `/usr/bin/time -l`, e um terceiro só o lê (o controle).

## Fixture

- Foto em teste é imagem de verdade, porque a API decodifica o envio: `TestImages.Png()`, ou `TestImages.JpegTakenWithAPhone()` quando o teste é de rotação ou EXIF.
- Nome e contato plausíveis (`"Mariana Alves Rocha"`), sem rótulo de papel no nome: quem diz o papel é a variável (`driverId`).
- ⛔ O dado passa pelas validações da própria aplicação: o e-mail institucional é `@(aluno.)?cps.sp.gov.br` (`FatecEmailAttribute`). Fixture inválida quebra o próximo teste que validar, sem dizer por quê.
- Valor em pt-BR, chave em inglês (`password = "SenhaForte123!"`).
