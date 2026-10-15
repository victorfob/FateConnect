namespace FateConnect.Api.Modules.Reports.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;

public record CreateReportDto : IWaivesContact
{
    [Required(ErrorMessage = "The report category is required.")]
    [SwaggerSchema("What the report is about.")]
    [SchemaExample("RecklessDriving")]
    public required EnumReportCategory Category { get; init; }

    private readonly string _description = string.Empty;

    [StringLength(500, MinimumLength = 10, ErrorMessage = "The description must have between 10 and 500 characters.")]
    [SwaggerSchema("What happened.")]
    [SchemaExample("The driver went over the speed limit on Avenida Itavuvu.")]
    public required string Description
    {
        get => _description;
        init => _description = value?.Trim() ?? string.Empty;
    }

    [SwaggerSchema("`true` hides who sent the report from the administrators and waives the contact.")]
    [SchemaExample(false)]
    public required bool IsAnonymous { get; init; }

    bool IWaivesContact.WaivesContact => IsAnonymous;

    [ValidImage]
    [SwaggerSchema("Photo that shows what happened: JPEG, PNG or WebP.")]
    public IFormFile? Image { get; init; }
}
