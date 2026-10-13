namespace FateConnect.Api.Modules.Reports.Extensions;

using FateConnect.Api.Modules.Reports.Enums;

public static class ReportCategoryExtensions
{
    public static string ToFriendlyName(this EnumReportCategory category) => category switch
    {
        EnumReportCategory.InappropriateBehavior => "assédio, bullying ou discriminação",
        EnumReportCategory.FakeProfile => "perfil falso",
        EnumReportCategory.Spam => "spam ou propaganda",

        EnumReportCategory.RecklessDriving => "direção imprudente na carona",
        EnumReportCategory.NoShow => "ausência sem aviso na carona",
        EnumReportCategory.ImproperCharging => "cobrança indevida na carona",

        EnumReportCategory.FraudulentClaim => "pedido de item que não é da pessoa",
        EnumReportCategory.FakeItemPosting => "cadastro falso de item",

        EnumReportCategory.Other => "outro motivo",

        _ => "motivo não especificado"
    };
}
