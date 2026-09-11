namespace FateConnect.Api.Modules.Common.Constants;

public static class RegexConstants
{
    public const string FatecEmailDomainPattern = @"^.*@(aluno\.)?cps\.sp\.gov\.br$";
    public const string FatecEmailLocalPartPattern = @"^[a-zA-Z0-9._%+-]+@[^@]*$";
    public const string FatecEmailDomainErrorMessage = "Use o e-mail @aluno.cps.sp.gov.br ou @cps.sp.gov.br";
    public const string FatecEmailLocalPartErrorMessage = "Use o e-mail sem acento nem espaço, como a Fatec emitiu";
}
