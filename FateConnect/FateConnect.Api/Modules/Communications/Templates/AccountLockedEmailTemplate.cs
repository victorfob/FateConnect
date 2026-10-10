namespace FateConnect.Api.Modules.Communications.Templates;

public static class AccountLockedEmailTemplate
{
    public static string Build(string fullName, string unlockLink)
    {
        var body = $@"
            <h2 style='color: #CF2E2E; margin-top: 0;'>Aviso de Segurança</h2>
            <p>Olá, {fullName},</p>
            <p>A sua conta foi bloqueada temporariamente devido a várias tentativas de acesso com a senha incorreta. Para garantir a segurança dos seus dados, o login ficará suspenso por <strong>30 minutos</strong>.</p>
            <p>Você pode aguardar esse tempo para tentar de novo ou <strong>desbloqueá-la imediatamente</strong> clicando no botão abaixo:</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{unlockLink}' style='display: inline-block; padding: 14px 28px; background-color: #CF2E2E; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Desbloquear Minha Conta
                </a>
            </div>

            <p>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{unlockLink}' style='color: #CF2E2E; word-break: break-all;'>{unlockLink}</a></p>

            <p style='margin-bottom: 0; margin-top: 15px;'>Caso não tenha sido você, não se preocupe. A sua senha atual protegeu o seu acesso e a sua conta continua segura.</p>";

        return EmailLayout.Header("Sua conta foi bloqueada - FateConnect") + body + EmailLayout.Footer();
    }
}
