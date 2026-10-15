namespace FateConnect.Api.Modules.Common.Utils;

public static class EnvironmentUtils
{
    public static string Required(string name, string purpose, Func<string, string?> lookup)
    {
        string? value = lookup(name);

        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"The environment variable {name} is required {purpose}.");

        return value;
    }
}
