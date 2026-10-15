using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.Users.Enums;

namespace FateConnect.Api.Tests.InAppNotifications;

public class NotificationContentsTests
{
    [Theory]
    [InlineData(EnumReportCategory.InappropriateBehavior, "assédio, bullying ou discriminação")]
    [InlineData(EnumReportCategory.FakeProfile, "perfil falso")]
    [InlineData(EnumReportCategory.Spam, "spam ou propaganda")]
    [InlineData(EnumReportCategory.RecklessDriving, "direção imprudente na carona")]
    [InlineData(EnumReportCategory.NoShow, "ausência sem aviso na carona")]
    [InlineData(EnumReportCategory.ImproperCharging, "cobrança indevida na carona")]
    [InlineData(EnumReportCategory.FraudulentClaim, "pedido de item que não é da pessoa")]
    [InlineData(EnumReportCategory.FakeItemPosting, "cadastro falso de item")]
    [InlineData((EnumReportCategory)0, "motivo não especificado")]
    public void ReportReceived_NamesTheReasonAsTheScreenDoes(EnumReportCategory category, string reason)
    {
        Assert.Equal(
            $"Recebemos sua denúncia de {reason}. O andamento aparece na página Denúncias, na aba Acompanhar.",
            NotificationContents.ReportReceived(category));
    }

    [Fact]
    public void ReportReceived_ForAnotherReason_LeavesTheReasonOut()
    {
        Assert.Equal(
            "Recebemos sua denúncia. O andamento aparece na página Denúncias, na aba Acompanhar.",
            NotificationContents.ReportReceived(EnumReportCategory.Other));
    }

    [Fact]
    public void ItemArchived_NamesTheItemAndTheInactivityWindow()
    {
        Assert.Equal(
            "O item “Garrafa térmica azul” foi arquivado automaticamente por inatividade, depois de 60 dias sem alteração.",
            NotificationContents.ItemArchived("Garrafa térmica azul"));
    }

    [Fact]
    public void RideToDestination_NamesTheDestinationWithoutPromisingItMatches()
    {
        Assert.Equal(
            "Uma nova carona para Rua das Flores, Vila Hortência foi ofertada. Confira se ela serve para você.",
            NotificationContents.RideToDestination("Rua das Flores, Vila Hortência"));
    }

    [Theory]
    [InlineData(EnumRemovalReason.Offensive, "conteúdo ofensivo ou discriminatório")]
    [InlineData(EnumRemovalReason.Misleading, "informação falsa ou enganosa")]
    [InlineData(EnumRemovalReason.ThirdPartyRights, "violação de direito de outra pessoa")]
    [InlineData(EnumRemovalReason.Commercial, "finalidade comercial ou de publicidade")]
    [InlineData(EnumRemovalReason.PersonalData, "exposição de dados de outra pessoa")]
    [InlineData((EnumRemovalReason)0, "violação dos termos de uso")]
    public void PublicationRemoved_OfARide_NamesTheDestinationTheReasonAndTheBan(EnumRemovalReason reason, string reasonName)
    {
        Assert.Equal(
            $"Sua carona para Jardim Toledo foi excluída por {reasonName}. Em caso de reincidência, a conta pode ser banida.",
            NotificationContents.PublicationRemoved(EnumPublication.Ride, "Jardim Toledo", reason));
    }

    [Fact]
    public void PublicationRemoved_OfAnItem_NamesTheItem()
    {
        Assert.Equal(
            "Seu item “Garrafa térmica azul” foi excluído por informação falsa ou enganosa. " +
                "Em caso de reincidência, a conta pode ser banida.",
            NotificationContents.PublicationRemoved(
                EnumPublication.LostAndFoundItem, "Garrafa térmica azul", EnumRemovalReason.Misleading));
    }
}
