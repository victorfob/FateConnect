namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.Enums;

public record LostAndFoundFilterDto : DateRangeFilterDto
{
    public string? SearchTerm { get; init; }

    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    public EnumLostAndFoundStatus? Status { get; init; }

    public bool? OnlyMine { get; init; }
}
