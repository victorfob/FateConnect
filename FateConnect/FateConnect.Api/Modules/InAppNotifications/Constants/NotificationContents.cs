namespace FateConnect.Api.Modules.InAppNotifications.Constants;

using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Denunciations.Extensions;
using FateConnect.Api.Modules.LostAndFound.Constants;

public static class NotificationContents
{
    private const string DenunciationProgress = "O andamento aparece na página Denúncias, na aba Acompanhar.";

    public static string DenunciationReceived(EnumDenunciationCategory category)
    {
        if (category == EnumDenunciationCategory.Other)
            return $"Recebemos sua denúncia. {DenunciationProgress}";

        return $"Recebemos sua denúncia de {category.ToFriendlyName()}. {DenunciationProgress}";
    }

    public static string ItemArchived(string itemName) =>
        $"O item “{itemName}” foi arquivado automaticamente por inatividade, depois de " +
            $"{LostAndFoundRetention.InactivityBeforeArchiving.Days} dias sem alteração.";

    public static string RideToDestination(string destination) =>
        $"Uma nova carona para {destination} foi ofertada. Confira se ela serve para você.";
}
