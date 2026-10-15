namespace FateConnect.Api.Modules.InAppNotifications.Constants;

using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Reports.Extensions;
using FateConnect.Api.Modules.LostAndFound.Constants;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Extensions;

public static class NotificationContents
{
    private const string ReportProgress = "O andamento aparece na página Denúncias, na aba Acompanhar.";

    public static string ReportReceived(EnumReportCategory category)
    {
        if (category == EnumReportCategory.Other)
            return $"Recebemos sua denúncia. {ReportProgress}";

        return $"Recebemos sua denúncia de {category.ToFriendlyName()}. {ReportProgress}";
    }

    public static string ItemArchived(string itemName) =>
        $"O item “{itemName}” foi arquivado automaticamente por inatividade, depois de " +
            $"{LostAndFoundRetention.InactivityBeforeArchiving.Days} dias sem alteração.";

    public static string PublicationRemoved(EnumPublication publication, string title, EnumRemovalReason reason) =>
        $"{RemovedPublication(publication, title)} por {reason.ToFriendlyName()}. " +
            "Em caso de reincidência, a conta pode ser banida.";

    public static string RideToDestination(string destination) =>
        $"Uma nova carona para {destination} foi ofertada. Confira se ela serve para você.";

    private static string RemovedPublication(EnumPublication publication, string title)
    {
        if (publication == EnumPublication.Ride)
            return $"Sua carona para {title} foi excluída";

        return $"Seu item “{title}” foi excluído";
    }
}
