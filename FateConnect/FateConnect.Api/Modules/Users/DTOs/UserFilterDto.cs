namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Enums;

public record UserFilterDto : PagedFilterDto
{
    public string? SearchTerm { get; init; }

    public EnumAccountStatus? Status { get; init; }

    public EnumProfileType? ProfileType { get; init; }
}
