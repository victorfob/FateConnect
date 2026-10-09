namespace FateConnect.Api.Modules.Communications.Templates;

public static class AccountLockedEmailTemplate
{
    public static string Build(string fullName, string unlockLink)
    {
        var body = $@"
            <h2 style='color: #d9534f; margin-top: 0;'>Aviso de Segurança</h2>
            <p>Olá, {fullName},</p>
            <p>A sua conta foi bloqueada por excesso de tentativas de login.</p>
            <p>Por medida de segurança, o acesso ficará suspenso por <strong>30 minutos</strong>.</p>
            <p>Você pode aguardar esse tempo para tentar de novo ou <strong>desbloqueá-la imediatamente</strong> clicando no botão abaixo:</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{unlockLink}' style='display: inline-block; padding: 14px 28px; background-color: #d9534f; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Desbloquear Minha Conta
                </a>
            </div>

            <p style='font-size: 14px; color: #555;'>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{unlockLink}' style='color: #E2080F; word-break: break-all;'>{unlockLink}</a></p>

            <p style='margin-bottom: 0; font-size: 14px; color: #555; margin-top: 15px;'>Caso não tenha sido você, recomendamos que faça a redefinição de senha na página de login o quanto antes.</p>";

        return EmailLayout.Header("Sua conta foi bloqueada - FateConnect") + body + EmailLayout.Footer();
    }
}
