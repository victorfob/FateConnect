using System.ComponentModel.DataAnnotations;
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
        List<ValidationResult> results = Validate(new CreateUsuarioDto
        {
            EmailFatec = "pessoa@aluno.cps.sp.gov.br",
            Senha = "SenhaForte123!",
            NomeCompleto = "Pessoa de Teste",
            DataNascimento = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Genero = (EnumGender)99,
            Enderecos = [],
            Contatos = [],
        });

        Assert.Contains(results, result => result.ErrorMessage == "Gênero inválido");
    }
}
