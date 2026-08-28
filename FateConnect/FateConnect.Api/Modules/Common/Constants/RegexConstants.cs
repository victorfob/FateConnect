namespace FateConnect.Api.Modules.Common.Constants;

public class RegexConstants
{
    public const string EmailInstitucionalFatec = @"^([a-zA-Z0-9._%+-]+)@(aluno\.)?cps\.sp\.gov\.br$";
    public const string MensagemErroEmailFatec = "O email deve ser do domínio @aluno.cps.sp.gov.br ou @cps.sp.gov.br";
}
