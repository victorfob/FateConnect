namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class TokenResponseDto
{
    [Required]
    [SwaggerSchema("Session token (JWT), sent back as `Authorization: Bearer <token>`.")]
    [SchemaExample("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    public string Token { get; set; } = string.Empty;
}
