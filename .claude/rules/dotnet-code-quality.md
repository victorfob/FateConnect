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

## Regra `IDExxxx` é silenciosa até alguém declarar a severidade

⛔ **`EnforceCodeStyleInBuild` e `TreatWarningsAsErrors` não bastam.** As regras de estilo do Roslyn nascem **abaixo de `warning`**, e o `TreatWarningsAsErrors` só promove o que já é warning — então elas rodam e não reprovam nada.

Medido em 30/08/2026: o Sonar acusou quatro `IDE0028` que o `dotnet build` deixou passar, com as duas propriedades ligadas no `.csproj`. Declarada a severidade no `.editorconfig`, a mesma violação vira erro de build:

```ini
dotnet_style_prefer_collection_expression = true:warning
```

⚠️ **A prova de que o mecanismo funciona já estava no arquivo:** `csharp_style_namespace_declarations = file_scoped:warning` reprova de verdade — um namespace block-scoped plantado derruba a build com `IDE0161`. A diferença entre as duas é só o `:warning`.

**A consequência prática:** a regra que você quer cobrada precisa estar escrita. Não existe "o analisador pega" — existe "o analisador pega o que foi declarado".
