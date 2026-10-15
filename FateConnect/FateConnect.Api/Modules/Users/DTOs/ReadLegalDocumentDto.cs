namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadLegalDocumentDto(
    [property: SwaggerSchema("Legal document.")]
    EnumDocumentType Document,
    [property: SwaggerSchema("Current version of the document, as published.")]
    string CurrentVersion,
    [property: SwaggerSchema("Whether the user has accepted the current version.")]
    bool AcceptedCurrentVersion
);
