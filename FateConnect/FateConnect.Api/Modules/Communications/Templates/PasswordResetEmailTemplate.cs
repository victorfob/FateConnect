namespace FateConnect.Api.Modules.Communications.Templates;

public static class PasswordResetEmailTemplate
{
    public static string Build(string fullName, string resetLink)
    {
        var body = $@"
            <h2 style='color: #333; margin-top: 0;'>Olá, {fullName}!</h2>
            <p>Recebemos um pedido para redefinir a senha da sua conta no FateConnect.</p>
            <p>Se foi você quem fez o pedido, clique no botão abaixo para escolher sua nova senha. Por segurança, este link expira em 30 minutos.</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{resetLink}' style='display: inline-block; padding: 14px 28px; background-color: #CF2E2E; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Redefinir Minha Senha
                </a>
            </div>

            <p>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{resetLink}' style='color: #CF2E2E; word-break: break-all;'>{resetLink}</a></p>

            <p style='margin-bottom: 0; margin-top: 15px;'>Se você não pediu a redefinição de senha, apenas ignore este e-mail. A sua conta continuará segura.</p>";

        return EmailLayout.Header("Redefinição de Senha - FateConnect") + body + EmailLayout.Footer();
    }
}
