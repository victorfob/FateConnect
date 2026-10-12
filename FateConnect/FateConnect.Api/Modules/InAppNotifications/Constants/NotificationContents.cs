namespace FateConnect.Api.Modules.InAppNotifications.Constants;

using System;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Denunciations.Extensions;
using FateConnect.Api.Modules.LostAndFound.Constants;

public static class NotificationContents
{
    public static string DenunciationReceived(EnumDenunciationCategory category)
    {
        if (category == EnumDenunciationCategory.Other)
        {
            return "Sua denúncia foi recebida e está em análise. Acompanhe o status na aba Minhas denúncias.";
        }

        return $"Recebemos sua denúncia por {category.ToFriendlyName()} e nossa equipe já está analisando o caso.";
    }

    public static string ItemArchived(string itemName) =>
    $"Seu anúncio '{itemName}' foi arquivado automaticamente por inatividade após {LostAndFoundRetention.InactivityBeforeArchiving.Days} dias.";

    public static string RideToDestination(string destination) =>
    $"Uma nova carona para {destination} acabou de ser publicada. Confira se ela serve para você.";
}
