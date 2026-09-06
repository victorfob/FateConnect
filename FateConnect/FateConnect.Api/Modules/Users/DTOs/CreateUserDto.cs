using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Common.Constants;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Enums;

namespace FateConnect.Api.Modules.Users.DTOs;

public class CreateUserDto
{
    [Required(ErrorMessage = "Informe o e-mail")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [RegularExpression(RegexConstants.FatecEmailPattern, ErrorMessage = RegexConstants.FatecEmailErrorMessage)]
    [MaxLength(150)]
    [DefaultValue("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a senha")]
    [MinLength(8, ErrorMessage = "Mínimo de 8 caracteres")]
    [DefaultValue("SenhaForte123!")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o nome completo")]
    [MaxLength(200)]
    [DefaultValue("João da Silva")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a data de nascimento")]
    [MinimumAge(18, ErrorMessage = "É necessário ter pelo menos 18 anos")]
    [DefaultValue("2000-01-01T00:00:00Z")]
    required public DateTime BirthDate { get; set; }

    [Required]
    [DefaultValue(1)]
    [EnumDataType(typeof(EnumGender), ErrorMessage = "Gênero inválido")]
    required public EnumGender Gender { get; set; }

    [Required]
    required public List<CreateAddressDto> Addresses { get; set; } =
    [];

    [Required]
    [MinLength(1, ErrorMessage = "Informe ao menos um contato")]
    required public List<CreateContactDto> Contacts { get; set; } =
    [];
}
