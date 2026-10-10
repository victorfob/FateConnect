using System.Net;
using FateConnect.Api.Modules.Auth.Constants;

namespace FateConnect.Api.Modules.Communications.Templates;

public static class AccountLockedEmailTemplate
{
    public static readonly string Subject = $"Sua conta do FateConnect foi bloqueada por {AuthConstants.LockoutMinutes} minutos";

    public static string Build(string fullName, string unlockLink)
    {
        string safeName = WebUtility.HtmlEncode(fullName);

        var body = $@"
            <h2 style='color: #333; margin-top: 0;'>Olá, {safeName}.</h2>
            <p>Sua conta foi bloqueada por {AuthConstants.MaxFailedLoginAttempts} senhas erradas seguidas. Ela destrava sozinha em {AuthConstants.LockoutMinutes} minutos, ou agora pelo botão abaixo. Depois, entre com a sua senha.</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{unlockLink}' style='display: inline-block; padding: 14px 28px; background-color: #CF2E2E; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Desbloquear conta
                </a>
            </div>

            <p>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{unlockLink}' style='color: #CF2E2E; word-break: break-all;'>{unlockLink}</a></p>

            <p style='margin-bottom: 0; margin-top: 15px;'>Se não foi você, alguém tentou entrar com o seu e-mail e errou a senha {AuthConstants.MaxFailedLoginAttempts} vezes. Para mais segurança, troque a senha em Meu perfil.</p>";

        return EmailLayout.Header(Subject) + body + EmailLayout.Footer();
    }
}
