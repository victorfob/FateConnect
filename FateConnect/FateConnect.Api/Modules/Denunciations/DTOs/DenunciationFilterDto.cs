namespace FateConnect.Api.Modules.Denunciations.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Denunciations.Enums;

public record DenunciationFilterDto : DateRangeFilterDto
{
    public string? SearchTerm { get; init; }
    public EnumDenunciationCategory? Category { get; init; }
    public EnumDenunciationStatus? Status { get; init; }
}
