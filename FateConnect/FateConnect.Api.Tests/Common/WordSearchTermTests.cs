using FateConnect.Api.Modules.Common.Utils;

namespace FateConnect.Api.Tests.Common;

public class WordSearchTermTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("   ")]
    [InlineData("&|!:*()'")]
    public void ToTsQuery_WithoutAnyWord_AnswersNothing(string? searchTerm)
    {
        Assert.Null(WordSearchTerm.ToTsQuery(searchTerm));
    }

    [Fact]
    public void ToTsQuery_JoinsEveryWordAsAPrefixWithoutAccentsOrCase()
    {
        Assert.Equal("(arvore:*) & (grande:*)", WordSearchTerm.ToTsQuery("ÁRVORE Grande"));
    }

    [Fact]
    public void ToTsQuery_DropsWhatIsNotALetterOrADigit()
    {
        Assert.Equal("(rua:*) & (10:*) & (drop:*)", WordSearchTerm.ToTsQuery("rua 10'); drop:* |"));
    }

    [Theory]
    [InlineData("jardim", "jardins")]
    [InlineData("jardins", "jardim")]
    [InlineData("anel", "aneis")]
    [InlineData("cartão", "cartoes")]
    [InlineData("cartões", "cartao")]
    [InlineData("pão", "paes")]
    [InlineData("mãos", "mao")]
    [InlineData("nuvem", "nuvens")]
    public void ToTsQuery_AddsTheIrregularOtherNumberOfTheWord(string searchTerm, string otherNumber)
    {
        Assert.Contains($"{otherNumber}:*", WordSearchTerm.ToTsQuery(searchTerm), StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("automóvel", "carro:*")]
    [InlineData("carros", "automovel:*")]
    [InlineData("automóveis", "veiculo:*")]
    [InlineData("sombrinha", "(guarda:* & chuva:*)")]
    [InlineData("guarda-chuva", "sombrinha:*")]
    [InlineData("óculos de sol", "oculos:*")]
    public void ToTsQuery_WidensAWordWithItsSynonyms(string searchTerm, string synonym)
    {
        Assert.Contains(synonym, WordSearchTerm.ToTsQuery(searchTerm), StringComparison.Ordinal);
    }

    [Fact]
    public void ToTsQuery_KeepsAWordWithoutSynonymsAlone()
    {
        Assert.Equal("(toledo:*)", WordSearchTerm.ToTsQuery("Toledo"));
    }
}
