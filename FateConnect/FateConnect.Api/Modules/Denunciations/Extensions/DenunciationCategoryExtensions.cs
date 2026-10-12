namespace FateConnect.Api.Modules.Denunciations.Extensions;

using FateConnect.Api.Modules.Denunciations.Enums;

public static class DenunciationCategoryExtensions
{
    public static string ToFriendlyName(this EnumDenunciationCategory category) => category switch
    {
        EnumDenunciationCategory.InappropriateBehavior => "assédio, bullying ou discriminação",
        EnumDenunciationCategory.FakeProfile => "perfil falso",
        EnumDenunciationCategory.Spam => "spam ou propaganda",

        EnumDenunciationCategory.RecklessDriving => "direção imprudente na carona",
        EnumDenunciationCategory.NoShow => "ausência sem aviso na carona",
        EnumDenunciationCategory.ImproperCharging => "cobrança indevida na carona",

        EnumDenunciationCategory.FraudulentClaim => "pedido de item que não é da pessoa",
        EnumDenunciationCategory.FakeItemPosting => "cadastro falso de item",

        EnumDenunciationCategory.Other => "outro motivo",

        _ => "motivo não especificado"
    };
}
