using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.InAppNotifications.Constants;

namespace FateConnect.Api.Tests.InAppNotifications;

public class NotificationContentsTests
{
    [Theory]
    [InlineData(EnumDenunciationCategory.InappropriateBehavior, "assédio, bullying ou discriminação")]
    [InlineData(EnumDenunciationCategory.FakeProfile, "perfil falso")]
    [InlineData(EnumDenunciationCategory.Spam, "spam ou propaganda")]
    [InlineData(EnumDenunciationCategory.RecklessDriving, "direção imprudente na carona")]
    [InlineData(EnumDenunciationCategory.NoShow, "ausência sem aviso na carona")]
    [InlineData(EnumDenunciationCategory.ImproperCharging, "cobrança indevida na carona")]
    [InlineData(EnumDenunciationCategory.FraudulentClaim, "pedido de item que não é da pessoa")]
    [InlineData(EnumDenunciationCategory.FakeItemPosting, "cadastro falso de item")]
    [InlineData((EnumDenunciationCategory)0, "motivo não especificado")]
    public void DenunciationReceived_NamesTheReasonAsTheScreenDoes(EnumDenunciationCategory category, string reason)
    {
        Assert.Equal(
            $"Recebemos sua denúncia de {reason}. O andamento aparece na página Denúncias, na aba Acompanhar.",
            NotificationContents.DenunciationReceived(category));
    }

    [Fact]
    public void DenunciationReceived_ForAnotherReason_LeavesTheReasonOut()
    {
        Assert.Equal(
            "Recebemos sua denúncia. O andamento aparece na página Denúncias, na aba Acompanhar.",
            NotificationContents.DenunciationReceived(EnumDenunciationCategory.Other));
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
}
