namespace FateConnect.Api.Modules.Denunciations.Extensions;

using FateConnect.Api.Modules.Denunciations.Enums;
using System;

public static class DenunciationCategoryExtensions
{
    public static string ToFriendlyName(this EnumDenunciationCategory category) => category switch
    {
        EnumDenunciationCategory.InappropriateBehavior => "assédio, bullying ou discriminação",
        EnumDenunciationCategory.FakeProfile => "perfil falso",
        EnumDenunciationCategory.Spam => "spam",

        EnumDenunciationCategory.RecklessDriving => "direção imprudente na carona",
        EnumDenunciationCategory.NoShow => "ausência sem aviso na carona",
        EnumDenunciationCategory.ImproperCharging => "cobrança indevida",

        EnumDenunciationCategory.FraudulentClaim => "reivindicação falsa de item",
        EnumDenunciationCategory.FakeItemPosting => "anúncio falso de item",

        EnumDenunciationCategory.Other => "outros motivos",

        _ => "motivo não especificado"
    };
}
