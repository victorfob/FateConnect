namespace FateConnect.Api.Tests.Fixtures;

public static class WordSearchExamples
{
    public static TheoryData<string, string, bool> Rows => new()
    {
        { "Jardim Toledo", "toledo", true },
        { "Jardim Toledo", "tol", true },
        { "Jardim Toledo", "toledo jardim", true },
        { "Jardim Toledo", "ledo", false },
        { "Capa de chuva", "capas", true },
        { "Ana Rosa", "ana", true },
        { "Mariana", "ana", false },
        { "Carro prata", "automóvel", true },
        { "Automóvel prata", "carro", true },
    };
}
