namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;

public class AdminUpdateUserDto
{
    [MaxLength(200)]
    public string? FullName { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [FatecEmail]
    [MaxLength(150)]
    public string? FatecEmail { get; set; }

    [MaxLength(11)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [MaxLength(150)]
    public string? ContactEmail { get; set; }
}
