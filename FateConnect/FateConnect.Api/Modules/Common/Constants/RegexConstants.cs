namespace FateConnect.Api.Modules.Common.Constants;

public static class RegexConstants
{
    public const string FatecEmailPattern = @"^([a-zA-Z0-9._%+-]+)@(aluno\.)?cps\.sp\.gov\.br$";
    public const string FatecEmailErrorMessage = "Use o e-mail @aluno.cps.sp.gov.br ou @cps.sp.gov.br";
}
