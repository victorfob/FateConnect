namespace FateConnect.Api.Modules.Common.Utils;

public static class EnvironmentUtils
{
    public static string Required(string name, string purpose)
    {
        string? value = Environment.GetEnvironmentVariable(name);

        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"A variável de ambiente {name} é obrigatória {purpose}.");

        return value;
    }
}
