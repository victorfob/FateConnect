using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FateConnect.Api.Modules.Auth.DTOs;

public class TokenResponseDto
{
    [Required]
    [DefaultValue("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    public string Token { get; set; } = string.Empty;

    [Required]
    [DefaultValue("João da Silva")]
    public string FullName { get; set; } = string.Empty;
}
