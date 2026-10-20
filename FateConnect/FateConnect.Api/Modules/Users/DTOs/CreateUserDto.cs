namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Users.Filters;
using Swashbuckle.AspNetCore.Annotations;

public class CreateUserDto
{
    [Required(ErrorMessage = "The e-mail is required.")]
    [EmailAddress(ErrorMessage = "Invalid e-mail.")]
    [FatecEmail]
    [MaxLength(150)]
    [SwaggerSchema("Institutional e-mail, `@cps.sp.gov.br` or `@aluno.cps.sp.gov.br`.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "The password is required.")]
    [MinLength(8, ErrorMessage = "The password must have at least 8 characters.")]
    [SwaggerSchema("Password.")]
    [SchemaExample("StrongPassword123!")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "The full name is required.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "The full name must have between 3 and 200 characters.")]
    [SwaggerSchema("Full name.")]
    [SchemaExample("João da Silva")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "The birth date is required.")]
    [MinimumAge(18, ErrorMessage = "You must be at least 18 years old.")]
    [SwaggerSchema("Birth date; the user must be at least 18.")]
    [SchemaExample("2000-01-01")]
    required public DateOnly BirthDate { get; set; }

    [Required(ErrorMessage = "The document acceptances are required.")]
    [MinLength(1, ErrorMessage = "Accept at least one document.")]
    [SwaggerSchema("Legal documents accepted at sign-up, each with its current version.")]
    [CurrentDocumentAcceptancesExample]
    required public List<DocumentAcceptanceDto> Acceptances { get; set; } =
    [];

    [DefaultValue(false)]
    [SwaggerSchema("Whether the user receives in-app notifications; `false` when absent.")]
    [SchemaExample(true)]
    public bool? ReceiveNotifications { get; set; }
}
