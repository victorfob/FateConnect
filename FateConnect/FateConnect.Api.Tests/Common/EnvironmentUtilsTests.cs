using FateConnect.Api.Modules.Common.Utils;

namespace FateConnect.Api.Tests.Common;

public class EnvironmentUtilsTests
{
    private static Func<string, string?> LookupWith(string? value) => _ => value;

    [Fact]
    public void Required_WithTheVariableSet_AnswersItsValue()
    {
        Assert.Equal(
            "present-value",
            EnvironmentUtils.Required("FATECONNECT_TEST", "for the test", LookupWith("present-value")));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("   ")]
    public void Required_WithTheVariableMissingOrBlank_FailsNamingItAndThePurpose(string? value)
    {
        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(
            () => EnvironmentUtils.Required("FATECONNECT_TEST", "for the test", LookupWith(value)));

        Assert.Equal("The environment variable FATECONNECT_TEST is required for the test.", exception.Message);
    }
}
