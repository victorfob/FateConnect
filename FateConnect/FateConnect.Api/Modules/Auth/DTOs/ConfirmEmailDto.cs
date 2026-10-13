namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public record ConfirmEmailDto(
    [Required(ErrorMessage = "The confirmation token is required.")]
    [property: SwaggerSchema("Token received in the confirmation link.")]
    [property: SchemaExample("4f8c2e7a9b1d4c6f8a0e2b4d6c8f1a3e")]
    string Token
);
