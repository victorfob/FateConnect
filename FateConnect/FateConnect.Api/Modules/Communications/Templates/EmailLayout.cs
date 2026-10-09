namespace FateConnect.Api.Modules.Communications.Templates;

using System;

public static class EmailLayout // melhorar todos os tamplates. Separar variáveis de cor. Ajustar para manter o padrão visual existente na aplicação. Ver possibilidade de adicionar o logotipo.
{
    public static string Header(string title) => $@"
        <!DOCTYPE html>
        <html lang='pt-BR'>
        <head>
            <meta charset='UTF-8'>
            <title>{title}</title>
        </head>
        <body style='font-family: sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;'>
            <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);'>
                <div style='background-color: #43545C; padding: 20px; text-align: center; color: white;'>
                    <h1 style='margin: 0; font-size: 24px; letter-spacing: 1px;'>FateConnect</h1>
                </div>
                <div style='padding: 30px; color: #333; line-height: 1.6;'>";

    public static string Footer() => $@"
                </div>
                <div style='background-color: #43545C; padding: 20px; text-align: center; font-size: 12px; color: #E0E0E0;'>
                    <p style='margin: 0 0 10px 0;'>Este é um e-mail automático, por favor, não responda.</p>
                    <p style='margin: 0;'>&copy; {DateTime.UtcNow.Year} FateConnect. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>";
}
