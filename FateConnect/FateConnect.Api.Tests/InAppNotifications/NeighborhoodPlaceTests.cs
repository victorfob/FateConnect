using FateConnect.Api.Modules.InAppNotifications.Utils;

namespace FateConnect.Api.Tests.InAppNotifications;

public class NeighborhoodPlaceTests
{
    [Theory]
    [InlineData("Jardim Toledo, Votorantim", "Jardim Toledo")]
    [InlineData("Jardim Toledo, Votorantim", "jardim toledo, votorantim")]
    [InlineData("Jardim Toledo", "Jardim Toledo, Votorantim")]
    [InlineData("Centro, Sorocaba", "Centro")]
    [InlineData("Além Ponte, Sorocaba", "Alem Ponte")]
    [InlineData("Jardim Toledo ,Votorantim", "  Jardim Toledo  ")]
    public void Matches_SameNeighborhoodAndNoConflictingCity_Notifies(string profile, string destination)
    {
        Assert.True(NeighborhoodPlace.Parse(profile).Matches(NeighborhoodPlace.Parse(destination)));
    }

    [Theory]
    [InlineData("Jardim Toledo, Votorantim", "Jardim Toledo, Sorocaba")]
    [InlineData("Centro, Sorocaba", "Centro Empresarial Sorocaba")]
    [InlineData("Jardim Toledo, Votorantim", "Jardim")]
    [InlineData("Jardim Toledo", "Rua X, Jardim Toledo")]
    public void Matches_DifferentNeighborhoodOrCity_DoesNotNotify(string profile, string destination)
    {
        Assert.False(NeighborhoodPlace.Parse(profile).Matches(NeighborhoodPlace.Parse(destination)));
    }

    [Fact]
    public void Parse_SplitsAtTheLastComma()
    {
        NeighborhoodPlace place = NeighborhoodPlace.Parse("Vila Nova, Zona Norte, Sorocaba");

        Assert.Equal("vila nova, zona norte", place.Neighborhood);
        Assert.Equal("sorocaba", place.City);
    }
}
