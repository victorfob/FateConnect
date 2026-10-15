namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record LostAndFoundFilterDto : DateRangeFilterDto
{
    [SwaggerParameter("Text searched in the name and the description, ignoring case and accents.")]
    public string? SearchTerm { get; init; }

    [SwaggerParameter("Only lost or only found items.")]
    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    [SwaggerParameter("Only items in this status.")]
    public EnumLostAndFoundStatus? Status { get; init; }

    [SwaggerParameter("`true` lists only the items registered by the signed-in user.")]
    public bool? OnlyMine { get; init; }
}
