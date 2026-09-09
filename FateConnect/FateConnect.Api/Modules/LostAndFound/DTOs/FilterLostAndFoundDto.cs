namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.Enums;

public record FilterLostAndFoundDto : DateRangeFilterDto
{
    public string? SearchTerm { get; init; }

    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    public EnumStatusLostAndFound? Status { get; init; }

    public bool? OnlyMyItems { get; init; }
}
