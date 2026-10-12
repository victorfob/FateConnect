using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Exceptions;

namespace FateConnect.Api.Tests.InAppNotifications;

public class InAppNotificationTests
{
    private static readonly DateTime Monday = new(2026, 10, 5, 12, 0, 0, DateTimeKind.Utc);

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WithoutContent_IsRefused(string content)
    {
        Assert.Throws<InvalidInAppNotificationContentException>(
            () => new InAppNotification(7, EnumInAppNotificationType.ItemArchived, content, null, Monday));
    }

    [Fact]
    public void Constructor_WithContent_KeepsItTrimmedAndUnread()
    {
        InAppNotification notification = new(7, EnumInAppNotificationType.ItemArchived, "  Seu item foi arquivado.  ", null, Monday);

        Assert.Equal("Seu item foi arquivado.", notification.Content);
        Assert.False(notification.IsRead);
        Assert.Null(notification.UpdatedAt);
    }

    [Fact]
    public void MarkAsRead_Twice_KeepsTheFirstReadingTime()
    {
        InAppNotification notification = new(7, EnumInAppNotificationType.ItemArchived, "Seu item foi arquivado.", null, Monday);

        notification.MarkAsRead(Monday.AddHours(1));
        notification.MarkAsRead(Monday.AddHours(2));

        Assert.True(notification.IsRead);
        Assert.Equal(Monday.AddHours(1), notification.UpdatedAt);
    }
}
