namespace FateConnect.Api.Modules.InAppNotifications.Entities;

using System;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Exceptions;
using FateConnect.Api.Modules.Users.Entities;

public class InAppNotification
{
    public int Id { get; init; }

    public int UserId { get; private set; }
    public EnumInAppNotificationType Type { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public string? ReferenceId { get; private set; }

    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public User? User { get; }

    protected InAppNotification() { }

    public InAppNotification(
        int userId,
        EnumInAppNotificationType type,
        string content,
        string? referenceId,
        DateTime createdAt)
    {
        ValidateContent(content);

        UserId = userId;
        Type = type;
        Content = content.Trim();
        ReferenceId = referenceId;

        IsRead = false;
        CreatedAt = createdAt;
        UpdatedAt = null;
    }

    public void MarkAsRead(DateTime now)
    {
        if (IsRead) return;

        IsRead = true;
        UpdatedAt = now;
    }

    private static void ValidateContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidInAppNotificationContentException();
    }
}
