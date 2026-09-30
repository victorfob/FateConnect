using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;

namespace FateConnect.Api.Tests.Users;

public class UserTests
{
    private static User NewUser(string fatecEmail) =>
        new(
            fatecEmail,
            "HashFalso123",
            "Mariana Alves Rocha",
            new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            EnumGender.Female,
            new UserContact("11999999999", "mariana.contato@gmail.com"),
            DateTime.UtcNow);

    [Fact]
    public void Constructor_WithAnInstitutionalEmail_KeepsItInLowerCase()
    {
        User user = NewUser("Mariana.Rocha@aluno.cps.sp.gov.br");

        Assert.Equal("mariana.rocha@aluno.cps.sp.gov.br", user.FatecEmail);
    }

    [Theory]
    [InlineData("")]
    [InlineData("nao-e-email")]
    [InlineData("mariana.rocha@gmail.com")]
    public void Constructor_WithAnEmailOutsideTheFatecDomain_IsRefusedForTheDomain(string fatecEmail)
    {
        Assert.Throws<InvalidFatecEmailDomainException>(() => NewUser(fatecEmail));
    }

    [Theory]
    [InlineData("mariana.joão@aluno.cps.sp.gov.br")]
    [InlineData("mariana rocha@cps.sp.gov.br")]
    public void Constructor_WithAnAccentOrSpaceBeforeTheAt_IsRefusedForTheLocalPart(string fatecEmail)
    {
        Assert.Throws<InvalidFatecEmailLocalPartException>(() => NewUser(fatecEmail));
    }
}
