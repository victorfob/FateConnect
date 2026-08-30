namespace FateConnect.Api.Modules.Common.Constants;

public static class RegexConstants
{
    public const string FatecEmailPattern = @"^([a-zA-Z0-9._%+-]+)@(aluno\.)?cps\.sp\.gov\.br$";
    public const string FatecEmailErrorMessage = "O email deve ser do domínio @aluno.cps.sp.gov.br ou @cps.sp.gov.br";
}
