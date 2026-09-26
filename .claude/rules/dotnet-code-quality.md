---
description: O analisador do Sonar no C# — ele roda dentro do `dotnet build` e reprova a compilação, e o que fazer com o que ele aponta
paths:
  - "FateConnect/FateConnect.Api/**"
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Qualidade do C# — o analisador roda no build

Os dois projetos referenciam o `SonarAnalyzer.CSharp`, então as regras que o Sonar aplica no PR rodam também no `dotnet build`, na sua máquina e no CI. Na sua máquina isso acontece sem você pedir: o `pre-commit` roda essa build quando o commit toca a API.

⛔ **Elas reprovam a compilação, não avisam.** O `.csproj` liga `TreatWarningsAsErrors`, e o que o analisador aponta vira **erro**. Build quebrado por `S6964` não é infraestrutura com defeito: é achado esperando correção.

**Corrigir, não silenciar.** Achado improcedente se responde por escrito — `#pragma warning disable` com o motivo ao lado, ou a justificativa no corpo do PR. Adiar o primeiro é o que faz o segundo parecer normal.

⚠️ **O conjunto do pacote não é idêntico ao da análise do PR.** O perfil de qualidade do projeto no SonarCloud liga e desliga regras, e parte do que ele mede — duplicação, cobertura, hotspot — nem é do analisador. Achado que aparece só no PR continua existindo; o build local encurta o laço, não o substitui.

Foi assim que os nove primeiros apareceram, ao referenciar o pacote: seis de `S6964` (campo de tipo-valor sem `required`, que aceitava a omissão e virava o valor padrão), dois de `S1118` e um `WriteAsJsonAsync` sem `CancellationToken`.

⚠️ **`Program` não pode virar `static`** para satisfazer o `S1118`: `WebApplicationFactory<Program>` a usa como argumento genérico, e classe estática não serve. O construtor privado resolve.

## Módulo novo renomeia o esqueleto que copiou — a duplicação conta identificador

⛔ **Copiar a estrutura do módulo vizinho é certo; copiar os nomes genéricos dele é o que reprova o gate.** A detecção de duplicação do Sonar conta **identificador**, não só forma — então dois arquivos com o mesmo esqueleto e nomes diferentes não duplicam, e com os mesmos nomes duplicam.

Medido em 14/09/2026, no #391: `DenunciationService.Logs.cs` nasceu com as quatro declarações `[LoggerMessage]` de `LostAndFoundService.Logs.cs` — `LogRecordCreated`, `LogRecordsRetrieved`, `LogRecordNotFound`, `LogRecordFound` e o parâmetro `recordId`. Deu **14 linhas em 1 bloco**, e o gate reprovou em 1,0% contra o teto de 0.

⚠️ **O controle que decide a saída está no próprio repo.** `RideService.Logs.cs` tem a mesma estrutura, nomeia pelo domínio (`LogRideCreated`, `rideId`) e na `main` **nenhum arquivo aparece duplicado**. Ou seja, não era caso de `sonar.cpd.exclusions` — a exclusão é legítima só onde os blocos são espelhados por construção, como as migrations de rename (ver `dotnet-migrations.md`). Aqui a correção era nomear pelo que a coisa é, e ela melhora o nome de qualquer jeito: `LogRecordCreated` num serviço de denúncia não diz nada.

⛔ **E esta reprovação só aparece depois que os testes ficam verdes**, porque o passo do Sonar roda **depois** do de testes: job vermelho nos testes esconde o gate inteiro.

## Regra `IDExxxx` é silenciosa até alguém declarar a severidade

⛔ **`EnforceCodeStyleInBuild` e `TreatWarningsAsErrors` não bastam.** As regras de estilo do Roslyn nascem **abaixo de `warning`**, e o `TreatWarningsAsErrors` só promove o que já é warning — então elas rodam e não reprovam nada.

Medido em 30/08/2026: o Sonar acusou quatro `IDE0028` que o `dotnet build` deixou passar, com as duas propriedades ligadas no `.csproj`. Declarada a severidade no `.editorconfig`, a mesma violação vira erro de build:

```ini
dotnet_style_prefer_collection_expression = true:warning
```

⚠️ **A prova de que o mecanismo funciona já estava no arquivo:** `csharp_style_namespace_declarations = file_scoped:warning` reprova de verdade — um namespace block-scoped plantado derruba a build com `IDE0161`. A diferença entre as duas é só o `:warning`.

**A consequência prática:** a regra que você quer cobrada precisa estar escrita. Não existe "o analisador pega" — existe "o analisador pega o que foi declarado".

## Dependência que valida licença na compilação: o ImageSharp 4

⛔ **O `SixLabors.ImageSharp` 4 roda um alvo de licença antes de compilar: em Debug ele só avisa, em Release ele reprova.** O CI compila em Debug e fica verde com o aviso; a imagem Docker publica em Release, na VPS, e ali reprova com `No Six Labors license found` se a chave faltar.

- **A chave é o conteúdo inteiro do `sixlabors.lic`** (licença comunitária, para código aberto) e é segredo: vai em `SIXLABORS_LICENSE` no `.env` de cada ambiente da VPS, como o `deploy/README.md` descreve, e nunca no repositório — `.gitignore` e `.dockerignore` recusam o arquivo.
- **Build em Release na sua máquina** pede o arquivo fora do repositório: `dotnet build -c Release -p:SixLaborsLicenseFile=<caminho>`.
- ⚠️ **O "License ID" que a Six Labors mostra não é a chave**: passado sozinho, o validador responde `The given key 'Kind' was not present in the dictionary`.

