namespace FateConnect.Api.Modules.InAppNotifications.Constants;

public static class NotificationContents
{
    public static string DenunciationReceived(string reason) =>
        $"Sua denúncia sobre '{reason.ToLowerInvariant()}' foi recebida. Acompanhe o status na aba Minhas denúncias.";
}
