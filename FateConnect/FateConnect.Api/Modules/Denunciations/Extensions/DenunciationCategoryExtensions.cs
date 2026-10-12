namespace FateConnect.Api.Modules.Denunciations.Extensions;

using FateConnect.Api.Modules.Denunciations.Enums;

public static class DenunciationCategoryExtensions
{
    public static string ToFriendlyName(this EnumDenunciationCategory category) => category switch
    {
        EnumDenunciationCategory.InappropriateBehavior => "comportamento inadequado",
        EnumDenunciationCategory.FakeProfile => "perfil falso",
        EnumDenunciationCategory.Spam => "spam",

        EnumDenunciationCategory.RecklessDriving => "direção perigosa",
        EnumDenunciationCategory.NoShow => "ausência",
        EnumDenunciationCategory.ImproperCharging => "cobrança indevida",

        EnumDenunciationCategory.FraudulentClaim => "reivindicação falsa de item",
        EnumDenunciationCategory.FakeItemPosting => "anúncio falso de item",

        _ => "outros motivos"
    };
}
