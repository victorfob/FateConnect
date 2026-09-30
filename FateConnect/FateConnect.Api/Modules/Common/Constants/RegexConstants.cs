namespace FateConnect.Api.Modules.Common.Constants;

using System.Text.RegularExpressions;

public static partial class RegexConstants
{
    public const string FatecEmailDomainPattern = @"^.*@(aluno\.)?cps\.sp\.gov\.br$";
    public const string FatecEmailLocalPartPattern = @"^[a-zA-Z0-9._%+-]+@[^@]*$";
    public const string FatecEmailDomainErrorMessage = "Use o e-mail @aluno.cps.sp.gov.br ou @cps.sp.gov.br";
    public const string FatecEmailLocalPartErrorMessage = "Use o e-mail sem acento nem espaço, como a Fatec emitiu";

    [GeneratedRegex(FatecEmailDomainPattern, RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 250)]
    public static partial Regex DomainRegex();

    [GeneratedRegex(FatecEmailLocalPartPattern, RegexOptions.None, matchTimeoutMilliseconds: 250)]
    public static partial Regex LocalPartRegex();
}
