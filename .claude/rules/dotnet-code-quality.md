---
description: O analisador do Sonar no C# — por que o `dotnet build` local não vê o que o CI reprova, e o que fazer com o que ele aponta
paths:
  - "FateConnect/FateConnect.Api/**"
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Qualidade do C# — o que o build local não mostra

⚠️ **`dotnet build` na sua máquina é cego para o analisador do Sonar.** Ele só entra na compilação quando o `dotnet sonarscanner begin` está ativo, e é isso que o CI faz. Resultado: código sai daqui com `0 Warning(s)` e chega no PR com avisos que ninguém viu.

Foi assim que um `WriteAsJsonAsync` sem `CancellationToken` atravessou o gate local no PR #201.

**O que fazer com o que aparecer no PR:** corrigir. O analisador existe para isso, e adiar o primeiro achado é o que faz o segundo parecer normal. Se o apontamento for mesmo improcedente, a saída é dizer por quê no PR — não ignorar em silêncio.

⚠️ **`TreatWarningsAsErrors` não alcança esses avisos.** O projeto liga a opção, e mesmo assim a compilação com o scanner passa com eles: são avisos do analisador, não do compilador. Não conte com o build para barrá-los.

**Dá para fechar essa cegueira:** o `SonarAnalyzer.CSharp` existe como pacote NuGet. Referenciado no projeto, os mesmos avisos passam a sair no `dotnet build` local. Enquanto ele não estiver lá, o primeiro lugar em que esses achados aparecem é o PR.
