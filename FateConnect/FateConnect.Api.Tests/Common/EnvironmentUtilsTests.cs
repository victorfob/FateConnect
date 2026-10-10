using FateConnect.Api.Modules.Common.Utils;

namespace FateConnect.Api.Tests.Common;

public class EnvironmentUtilsTests
{
    [Fact]
    public void Required_WithTheVariableSet_AnswersItsValue()
    {
        string name = $"FATECONNECT_TESTE_{Guid.NewGuid():N}";
        Environment.SetEnvironmentVariable(name, "valor-presente");

        Assert.Equal("valor-presente", EnvironmentUtils.Required(name, "para o teste"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("   ")]
    public void Required_WithTheVariableMissingOrBlank_FailsNamingItAndThePurpose(string? value)
    {
        string name = $"FATECONNECT_TESTE_{Guid.NewGuid():N}";
        Environment.SetEnvironmentVariable(name, value);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(
            () => EnvironmentUtils.Required(name, "para o teste"));

        Assert.Equal($"A variável de ambiente {name} é obrigatória para o teste.", exception.Message);
    }
}
