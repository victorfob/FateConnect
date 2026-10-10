using System.Net;
using FateConnect.Api.Modules.Auth.Constants;

namespace FateConnect.Api.Modules.Communications.Templates;

public static class ConfirmationEmailTemplate
{
    public const string Subject = "Confirme seu e-mail do FateConnect";

    public static string Build(string fullName, string confirmationLink)
    {
        string safeName = WebUtility.HtmlEncode(fullName);

        var body = $@"
            <h2 style='color: #333; margin-top: 0;'>Olá, {safeName}.</h2>
            <p>Você criou uma conta no FateConnect com este e-mail. Para entrar, confirme que ele é seu:</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{confirmationLink}' style='display: inline-block; padding: 14px 28px; background-color: #CF2E2E; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Confirmar e-mail
                </a>
            </div>

            <p>O link vale por {AuthConstants.EmailConfirmationHours} horas.</p>

            <p>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{confirmationLink}' style='color: #CF2E2E; word-break: break-all;'>{confirmationLink}</a></p>

            <p style='margin-bottom: 0; margin-top: 15px;'>Se não foi você que criou a conta, ignore este e-mail: sem a confirmação, ninguém entra com ele.</p>";

        return EmailLayout.Header(Subject) + body + EmailLayout.Footer();
    }
}
