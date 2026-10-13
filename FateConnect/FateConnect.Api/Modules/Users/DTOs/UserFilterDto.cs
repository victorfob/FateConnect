namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record UserFilterDto : PagedFilterDto
{
    [SwaggerParameter("Text searched in the name, the institutional e-mail, the contact e-mail and the phone, " +
        "ignoring case and accents.")]
    public string? SearchTerm { get; init; }

    [SwaggerParameter("Only accounts in this status.")]
    public EnumAccountStatus? Status { get; init; }

    [SwaggerParameter("Only accounts with this profile.")]
    public EnumProfileType? ProfileType { get; init; }
}
