namespace FateConnect.Api.Modules.Users.DTOs;

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Users.Filters;
using Swashbuckle.AspNetCore.Annotations;

public class AcceptDocumentsDto
{
    [Required(ErrorMessage = "The document acceptances are required.")]
    [MinLength(1, ErrorMessage = "Accept at least one document.")]
    [SwaggerSchema("Legal documents accepted, each with the current version.")]
    [CurrentDocumentAcceptancesExample]
    required public List<DocumentAcceptanceDto> Acceptances { get; set; } =
    [];
}
