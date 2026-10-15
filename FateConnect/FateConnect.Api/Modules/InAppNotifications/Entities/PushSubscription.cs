namespace FateConnect.Api.Modules.InAppNotifications.Entities;

using System;

public class PushSubscription
{
    public int Id { get; init; }

    public int UserId { get; private set; }
    public string Endpoint { get; private set; } = string.Empty;
    public string P256dh { get; private set; } = string.Empty;
    public string Auth { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    protected PushSubscription() { }

    public PushSubscription(int userId, string endpoint, string p256dh, string auth, DateTime createdAt)
    {
        UserId = userId;
        Endpoint = endpoint;
        P256dh = p256dh;
        Auth = auth;
        CreatedAt = createdAt;
    }

    public void Renew(int userId, string p256dh, string auth)
    {
        UserId = userId;
        P256dh = p256dh;
        Auth = auth;
    }
}
