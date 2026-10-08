namespace FateConnect.Api.Modules.Communications.Templates;

public static class PasswordResetEmailTemplate // criei um esboço, mas precisará melhorar
{
    public static string Build(string fullName, string resetLink)
    {
        var body = $@"
            <h2 style='color: #333; margin-top: 0;'>Olá, {fullName}!</h2>
            <p>Recebemos um pedido para redefinir a senha da sua conta no FateConnect.</p>
            <p>Se foi você, clique no botão abaixo para criar uma nova senha. <br/> <strong>Este link é válido por 30 minutos.</strong></p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{resetLink}' style='display: inline-block; padding: 14px 28px; background-color: #E2080F; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Redefinir Minha Senha
                </a>
            </div>

            <p style='font-size: 14px; color: #555;'>Se o botão não funcionar, copie e cole este link no seu navegador: <br/> <a href='{resetLink}' style='color: #E2080F; word-break: break-all;'>{resetLink}</a></p>
            <p style='margin-bottom: 0; font-size: 14px; color: #555; margin-top: 15px;'>Se você não pediu a redefinição de senha, apenas ignore este e-mail. A sua conta continuará segura.</p>";

        return EmailLayout.Header("Redefinição de Senha - FateConnect") + body + EmailLayout.Footer();
    }
}
