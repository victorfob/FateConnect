namespace FateConnect.Api.Modules.Users.Extensions;

using FateConnect.Api.Modules.Users.Enums;

public static class RemovalReasonExtensions
{
    public static string ToFriendlyName(this EnumRemovalReason reason) => reason switch
    {
        EnumRemovalReason.Offensive => "conteúdo ofensivo ou discriminatório",
        EnumRemovalReason.Misleading => "informação falsa ou enganosa",
        EnumRemovalReason.ThirdPartyRights => "violação de direito de outra pessoa",
        EnumRemovalReason.Commercial => "finalidade comercial ou de publicidade",
        EnumRemovalReason.PersonalData => "exposição de dados de outra pessoa",

        _ => "violação dos termos de uso"
    };
}
