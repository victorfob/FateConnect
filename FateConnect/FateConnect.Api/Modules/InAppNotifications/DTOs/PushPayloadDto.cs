namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using FateConnect.Api.Modules.InAppNotifications.Enums;

public record PushPayloadDto(int Id, EnumInAppNotificationType Type, string Content, string? ReferenceId);
