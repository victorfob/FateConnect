namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class TokenResponseDto
{
    [Required]
    [DefaultValue("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    public string Token { get; set; } = string.Empty;
}
