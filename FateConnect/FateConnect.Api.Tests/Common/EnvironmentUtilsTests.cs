using FateConnect.Api.Modules.Common.Utils;

namespace FateConnect.Api.Tests.Common;

public class EnvironmentUtilsTests
{
    private static Func<string, string?> LookupWith(string? value) => _ => value;

    [Fact]
    public void Required_WithTheVariableSet_AnswersItsValue()
    {
        Assert.Equal("valor-presente", EnvironmentUtils.Required("FATECONNECT_TESTE", "para o teste", LookupWith("valor-presente")));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("   ")]
    public void Required_WithTheVariableMissingOrBlank_FailsNamingItAndThePurpose(string? value)
    {
        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(
            () => EnvironmentUtils.Required("FATECONNECT_TESTE", "para o teste", LookupWith(value)));

        Assert.Equal("A variável de ambiente FATECONNECT_TESTE é obrigatória para o teste.", exception.Message);
    }
}
