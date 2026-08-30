using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace FateConnect.Api.Modules.Users.DTOs;

public class CreateContactDto
{
    [Required(ErrorMessage = "Informe o telefone")]
    [MaxLength(11)]
    [DefaultValue("11999999999")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o e-mail para contato")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [MaxLength(150)]
    [DefaultValue("pedro.augusto@gmail.com")]
    public string ContactEmail { get; set; } = string.Empty;
}
