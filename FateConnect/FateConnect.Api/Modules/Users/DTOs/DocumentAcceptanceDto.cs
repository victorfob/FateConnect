namespace FateConnect.Api.Modules.Users.DTOs;

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.Annotations;

public class DocumentAcceptanceDto : IValidatableObject
{
    [Required]
    [EnumDataType(typeof(EnumDocumentType), ErrorMessage = "Invalid document.")]
    [SwaggerSchema("Legal document accepted.")]
    [SchemaExample("TermsOfUse")]
    required public EnumDocumentType Document { get; set; }

    [Required(ErrorMessage = "The version of the accepted document is required.")]
    [MaxLength(20)]
    [SwaggerSchema("Version of the accepted document; only the current one, as published, is accepted.")]
    [SchemaExample("2026-10-14")]
    required public string Version { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        ILegalDocumentVersions versions = validationContext.GetRequiredService<ILegalDocumentVersions>();

        if (versions.IsCurrent(Document, Version))
            yield break;

        yield return new ValidationResult(
            "The version of the accepted document is not the current one.",
            [nameof(Version)]);
    }
}
