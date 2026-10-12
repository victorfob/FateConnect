namespace FateConnect.Api.Modules.InAppNotifications.Constants;

using System;

public static class NotificationContents
{
    public static string DenunciationReceived(string reason)
    {
        if (reason.Equals("outros motivos", StringComparison.OrdinalIgnoreCase))
        {
            return "Sua denúncia foi recebida e está em análise. Acompanhe o status na aba Minhas denúncias.";
        }

        return $"Sua denúncia por {reason.ToLowerInvariant()} foi recebida. Acompanhe o status na aba Minhas denúncias.";
    }

    public static string ItemArchived(string itemName) =>
        $"Seu anúncio '{itemName}' foi arquivado automaticamente por inatividade após 60 dias.";
}
