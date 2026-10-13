using FateConnect.Api.Infrastructure.Configuration;

namespace FateConnect.Api.Tests.Infrastructure;

public class RequiredSettingsTests
{
    private static readonly Dictionary<string, string> EveryVariable = new()
    {
        ["DB_CONNECTION"] = "Host=banco;Database=fateconnect",
        ["JWT_SECRET"] = "segredo-de-teste-com-tamanho-suficiente",
        ["JWT_ISSUER"] = "FateConnectTest",
        ["JWT_AUDIENCE"] = "FateConnectTestWeb",
        ["PUBLIC_URL"] = "https://fateconnect.test",
        ["EMAIL_SENDER"] = "nao-responda@fateconnect.test",
        ["RESEND_API_KEY"] = "re_chave_falsa",
    };

    private static Func<string, string?> LookupWithout(string? missing) =>
        name => name == missing ? null : EveryVariable.GetValueOrDefault(name);

    [Fact]
    public void Read_WithEveryVariable_AnswersTheirValues()
    {
        RequiredSettings settings = RequiredSettings.Read(LookupWithout(null));

        Assert.Equal("Host=banco;Database=fateconnect", settings.DbConnection);
        Assert.Equal("segredo-de-teste-com-tamanho-suficiente", settings.JwtSecret);
        Assert.Equal("FateConnectTest", settings.JwtIssuer);
        Assert.Equal("FateConnectTestWeb", settings.JwtAudience);
        Assert.Equal("https://fateconnect.test", settings.PublicUrl);
        Assert.Equal("nao-responda@fateconnect.test", settings.EmailSender);
        Assert.Equal("re_chave_falsa", settings.ResendApiKey);
    }

    [Theory]
    [InlineData("DB_CONNECTION")]
    [InlineData("JWT_SECRET")]
    [InlineData("JWT_ISSUER")]
    [InlineData("JWT_AUDIENCE")]
    [InlineData("PUBLIC_URL")]
    [InlineData("EMAIL_SENDER")]
    [InlineData("RESEND_API_KEY")]
    public void Read_WithoutARequiredVariable_RefusesToStartNamingIt(string missing)
    {
        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(
            () => RequiredSettings.Read(LookupWithout(missing)));

        Assert.StartsWith(
            $"The environment variable {missing} is required",
            exception.Message,
            StringComparison.Ordinal);
    }
}
