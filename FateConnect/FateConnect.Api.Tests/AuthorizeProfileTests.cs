using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Users.Enums;

namespace FateConnect.Api.Tests;

public class AuthorizeProfileTests
{
    [Fact]
    public void Constructor_RequiringAdministrator_AdmitsOnlyAdministrator()
    {
        AuthorizeProfileAttribute attribute = new(EnumProfileType.Administrator);

        Assert.Equal("Administrator", attribute.Roles);
    }

    [Fact]
    public void Constructor_RequiringOperator_AdmitsAdministratorAsWell()
    {
        AuthorizeProfileAttribute attribute = new(EnumProfileType.Operator);

        Assert.Equal("Operator,Administrator", attribute.Roles);
    }

    [Fact]
    public void Constructor_WithAProfileOutsideTheHierarchy_FailsFast()
    {
        UnconfiguredProfileHierarchyException exception =
            Assert.Throws<UnconfiguredProfileHierarchyException>(
                () => new AuthorizeProfileAttribute((EnumProfileType)9));

        Assert.Equal(
            "A hierarquia de acesso para o perfil '9' não foi configurada no AuthorizeProfileAttribute. Atualize o mapa de perfis permitidos.",
            exception.Message);
    }

    [Fact]
    public void EveryDeclaredProfile_IsCoveredByTheHierarchy()
    {
        EnumProfileType[] declaredProfiles = Enum.GetValues<EnumProfileType>();

        Assert.All(declaredProfiles, profile => Assert.NotNull(new AuthorizeProfileAttribute(profile).Roles));
    }
}
