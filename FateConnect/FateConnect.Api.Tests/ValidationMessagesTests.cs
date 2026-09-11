using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Common.Constants;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;

namespace FateConnect.Api.Tests;

public class ValidationMessagesTests
{
    private static List<ValidationResult> Validate(object model)
    {
        List<ValidationResult> results = [];
        Validator.TryValidateObject(model, new ValidationContext(model), results, validateAllProperties: true);

        return results;
    }

    [Fact]
    public void AnUndefinedRideType_IsRejectedInPortuguese()
    {
        List<ValidationResult> results = Validate(new FilterRideDto { RideType = (EnumRideType)99 });

        Assert.Contains(results, result => result.ErrorMessage == "Tipo de carona inválido");
    }

    [Fact]
    public void AnUndefinedGender_IsRejectedInPortuguese()
    {
        List<ValidationResult> results = Validate(new CreateUserDto
        {
            FatecEmail = "mariana.rocha@aluno.cps.sp.gov.br",
            Password = "SenhaForte123!",
            FullName = "Mariana Alves Rocha",
            BirthDate = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Gender = (EnumGender)99,
            Contacts = [],
        });

        Assert.Contains(results, result => result.ErrorMessage == "Gênero inválido");
    }

    [Fact]
    public void AnUnderageBirthDate_IsRejectedInPortuguese()
    {
        List<ValidationResult> results = Validate(new CreateUserDto
        {
            FatecEmail = "mariana.rocha@aluno.cps.sp.gov.br",
            Password = "SenhaForte123!",
            FullName = "Mariana Alves Rocha",
            BirthDate = DateTime.UtcNow.Date.AddYears(-10),
            Gender = EnumGender.Female,
            Contacts = [],
        });

        Assert.Contains(results, result => result.ErrorMessage == "É necessário ter pelo menos 18 anos");
    }

    [Fact]
    public void AnInstitutionalEmail_IsAcceptedByBothChecks()
    {
        List<ValidationResult> results = Validate(LoginWith("jose_silva@aluno.cps.sp.gov.br"));

        Assert.DoesNotContain(results, result => result.ErrorMessage == RegexConstants.FatecEmailDomainErrorMessage);
        Assert.DoesNotContain(results, result => result.ErrorMessage == RegexConstants.FatecEmailLocalPartErrorMessage);
    }

    [Theory]
    [InlineData("joao.silva@gmail.com")]
    [InlineData("nao-e-email")]
    [InlineData("maria@")]
    public void AnEmailOutsideTheInstitutionalDomain_IsRejectedNamingTheDomain(string email)
    {
        List<ValidationResult> results = Validate(LoginWith(email));

        Assert.Contains(results, result => result.ErrorMessage == RegexConstants.FatecEmailDomainErrorMessage);
        Assert.DoesNotContain(results, result => result.ErrorMessage == RegexConstants.FatecEmailLocalPartErrorMessage);
    }

    [Theory]
    [InlineData("josé_silva@aluno.cps.sp.gov.br")]
    [InlineData("ze chicrete@cps.sp.gov.br")]
    [InlineData("@cps.sp.gov.br")]
    public void AnEmailWithAnUnsupportedLocalPart_IsRejectedNamingWhatComesBeforeTheAtSign(string email)
    {
        List<ValidationResult> results = Validate(LoginWith(email));

        Assert.Contains(results, result => result.ErrorMessage == RegexConstants.FatecEmailLocalPartErrorMessage);
        Assert.DoesNotContain(results, result => result.ErrorMessage == RegexConstants.FatecEmailDomainErrorMessage);
    }

    [Fact]
    public void AnAccentedEmailInTheSignup_IsRejectedByTheSameCheck()
    {
        List<ValidationResult> results = Validate(new CreateUserDto
        {
            FatecEmail = "josé_silva@aluno.cps.sp.gov.br",
            Password = "SenhaForte123!",
            FullName = "José Alves Rocha",
            BirthDate = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Gender = EnumGender.Male,
            Contacts = [],
        });

        Assert.Contains(results, result => result.ErrorMessage == RegexConstants.FatecEmailLocalPartErrorMessage);
    }

    private static LoginDto LoginWith(string email) =>
        new() { FatecEmail = email, Password = "SenhaForte123!" };
}
