namespace FateConnect.Api.Modules.Common.Constants;

using System.Text.RegularExpressions;

public static partial class RegexConstants
{
    public const string FatecEmailDomainPattern = @"^.*@(aluno\.)?cps\.sp\.gov\.br$";
    public const string FatecEmailLocalPartPattern = @"^[a-zA-Z0-9._%+-]+@[^@]*$";
    public const string FatecEmailDomainErrorMessage = "Use an @aluno.cps.sp.gov.br or @cps.sp.gov.br e-mail.";
    public const string FatecEmailLocalPartErrorMessage =
        "Use the e-mail without accents or spaces, as Fatec issued it.";

    [GeneratedRegex(FatecEmailDomainPattern, RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 250)]
    public static partial Regex DomainRegex();

    [GeneratedRegex(FatecEmailLocalPartPattern, RegexOptions.None, matchTimeoutMilliseconds: 250)]
    public static partial Regex LocalPartRegex();
}
