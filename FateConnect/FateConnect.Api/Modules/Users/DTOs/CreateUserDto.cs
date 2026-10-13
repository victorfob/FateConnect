namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public class CreateUserDto
{
    [Required(ErrorMessage = "Informe o e-mail")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [FatecEmail]
    [MaxLength(150)]
    [SwaggerSchema("Institutional e-mail, `@cps.sp.gov.br` or `@aluno.cps.sp.gov.br`.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a senha")]
    [MinLength(8, ErrorMessage = "Mínimo de 8 caracteres")]
    [SwaggerSchema("Password.")]
    [SchemaExample("StrongPassword123!")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o nome completo")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "O nome completo deve ter entre 3 e 200 caracteres.")]
    [SwaggerSchema("Full name.")]
    [SchemaExample("João da Silva")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a data de nascimento")]
    [MinimumAge(18, ErrorMessage = "É necessário ter pelo menos 18 anos")]
    [SwaggerSchema("Birth date; the user must be at least 18.")]
    [SchemaExample("2000-01-01T00:00:00Z")]
    required public DateTime BirthDate { get; set; }

    [Required]
    [EnumDataType(typeof(EnumGender), ErrorMessage = "Gênero inválido")]
    [SwaggerSchema("Gender of the user.")]
    [SchemaExample("Male")]
    required public EnumGender Gender { get; set; }

    [Required(ErrorMessage = "Informe o aceite dos documentos")]
    [MinLength(1, ErrorMessage = "Informe o aceite de ao menos um documento")]
    [SwaggerSchema("Legal documents accepted at sign-up, each with its version.")]
    [SchemaExample(
        """
        [
          { "document": "TermsOfUse", "version": "2026-08-27" },
          { "document": "PrivacyPolicy", "version": "2026-10-08" }
        ]
        """,
        IsJson = true)]
    required public List<DocumentAcceptanceDto> Acceptances { get; set; } =
    [];

    [DefaultValue(false)]
    [SwaggerSchema("Whether the user receives in-app notifications; `false` when absent.")]
    [SchemaExample(true)]
    public bool? ReceiveNotifications { get; set; }
}
