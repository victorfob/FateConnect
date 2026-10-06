namespace FateConnect.Api.Modules.Communications.Templates;

public static class ConfirmationEmailTemplate // criei um esboço, mas precisará melhorar
{
    public static string Build(string fullName, string confirmationLink)
    {
        var body = $@"
            <h2 style='color: #333; margin-top: 0;'>Bem-vindo(a), {fullName}!</h2>
            <p>Falta pouco para você acessar a plataforma FateConnect.</p>
            <p>Clique no botão abaixo para confirmar sua conta de forma segura:</p>

            <div style='text-align: center; margin: 35px 0;'>
                <a href='{confirmationLink}' style='display: inline-block; padding: 14px 28px; background-color: #E2080F; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    Confirmar meu E-mail
                </a>
            </div>

            <p style='margin-bottom: 0; font-size: 14px; color: #555;'>Se você não solicitou este cadastro, pode ignorar este e-mail com segurança.</p>";

        return EmailLayout.Header("Confirme sua conta no FateConnect") + body + EmailLayout.Footer();
    }
}
