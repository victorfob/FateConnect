namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Infrastructure.Validation;
using System.ComponentModel.DataAnnotations;

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
