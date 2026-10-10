using System.Net;
using FateConnect.Api.Modules.Auth.Constants;

namespace FateConnect.Api.Modules.Communications.Templates;

public static class PasswordResetEmailTemplate
{
    public const string Subject = "Redefina sua senha do FateConnect";

    public static string Build(string fullName, string resetLink)
    {
        string safeName = WebUtility.HtmlEncode(fullName);

        var body = $@"
            <h2 style='color: #333; margin-top: 0;'>Olá, {safeName}.</h2>
            <p>Recebemos um pedido para redefinir a senha da sua conta no FateConnect.</p>
            <p>Se foi você, escolha a nova senha pelo botão abaixo. O link vale por {AuthConstants.PasswordResetMinutes} minutos e serve uma vez.</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{resetLink}' style='display: inline-block; padding: 14px 28px; background-color: #CF2E2E; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Redefinir senha
                </a>
            </div>

            <p>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{resetLink}' style='color: #CF2E2E; word-break: break-all;'>{resetLink}</a></p>

            <p style='margin-bottom: 0; margin-top: 15px;'>Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>";

        return EmailLayout.Header(Subject) + body + EmailLayout.Footer();
    }
}
