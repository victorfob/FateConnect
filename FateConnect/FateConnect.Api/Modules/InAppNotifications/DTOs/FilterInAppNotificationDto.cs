namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Enums;

public record FilterInAppNotificationDto : PagedFilterDto
{
    public bool? IsRead { get; init; }
    public EnumInAppNotificationType? Type { get; init; }
}
