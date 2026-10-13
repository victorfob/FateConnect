namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public class DocumentAcceptanceDto
{
    [Required]
    [EnumDataType(typeof(EnumDocumentType), ErrorMessage = "Documento inválido")]
    [SwaggerSchema("Legal document accepted.")]
    [SchemaExample("TermsOfUse")]
    required public EnumDocumentType Document { get; set; }

    [Required(ErrorMessage = "Informe a versão do documento aceito")]
    [MaxLength(20)]
    [SwaggerSchema("Version of the accepted document, as published.")]
    [SchemaExample("2026-08-27")]
    required public string Version { get; set; }
}
