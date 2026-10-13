namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record FilterInAppNotificationDto : PagedFilterDto
{
    [SwaggerParameter("`true` lists only the read notifications, and `false` only the unread ones.")]
    public bool? IsRead { get; init; }
    [SwaggerParameter("Only notifications of this type.")]
    public EnumInAppNotificationType? Type { get; init; }
}
