using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Common.Constants;
using FateConnect.Api.Modules.Users.DTOs;

namespace FateConnect.Api.Tests.Common;

public class ValidationMessagesTests
{
    private static List<ValidationResult> Validate(object model)
    {
        List<ValidationResult> results = [];
        Validator.TryValidateObject(model, new ValidationContext(model), results, validateAllProperties: true);

        return results;
    }

    [Fact]
    public void AnUnderageBirthDate_IsRejected()
    {
        List<ValidationResult> results = Validate(new CreateUserDto
        {
            FatecEmail = "mariana.rocha@aluno.cps.sp.gov.br",
            Password = "SenhaForte123!",
            FullName = "Mariana Alves Rocha",
            BirthDate = DateOnly.FromDateTime(DateTime.UtcNow).AddYears(-10),
            Acceptances = [],
        });

        Assert.Contains(results, result => result.ErrorMessage == "You must be at least 18 years old.");
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
            BirthDate = new DateOnly(2000, 1, 1),
            Acceptances = [],
        });

        Assert.Contains(results, result => result.ErrorMessage == RegexConstants.FatecEmailLocalPartErrorMessage);
    }

    private static LoginDto LoginWith(string email) =>
        new() { FatecEmail = email, Password = "SenhaForte123!" };
}
