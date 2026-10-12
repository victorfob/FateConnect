namespace FateConnect.Api.Modules.Emails.Templates;

using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using Mjml.Net;

public static class EmailLayout
{
    private const string AutomaticNotice = "Este e-mail é automático e não recebe respostas.";
    private const string BrokenButtonHint = "Se o botão não funcionar, copie e cole este link no seu navegador:";

    private static readonly MjmlRenderer Renderer = new();
    private static readonly MjmlOptions Options = new() { Beautify = false };

    public static string Html(AccountEmail email, string fullName, string link, string logoUrl, int year)
    {
        IReadOnlyList<string> paragraphs = email.ParagraphsPointingTo(AccountEmails.ButtonPointer);
        string safeLink = WebUtility.HtmlEncode(link);

        string body = string.Concat(paragraphs.Select(paragraph => Paragraph(Encode(paragraph))));

        string mjml = $"""
            <mjml lang="pt-BR">
              <mj-head>
                <mj-title>{Encode(email.Subject)}</mj-title>
                <mj-preview>{Encode(paragraphs[0])}</mj-preview>
                <mj-attributes>
                  <mj-all font-family="{EmailTheme.FontFamily}" />
                  <mj-text color="{EmailTheme.Text}" font-size="{EmailTheme.BodyFontSize}" line-height="{EmailTheme.LineHeight}" padding="{EmailTheme.ParagraphPadding}" />
                </mj-attributes>
              </mj-head>
              <mj-body background-color="{EmailTheme.Background}" width="{EmailTheme.Width}">
                <mj-section full-width="full-width" background-color="{EmailTheme.Chrome}" padding="{EmailTheme.ChromePadding}">
                  <mj-column>
                    <mj-text color="{EmailTheme.ChromeText}" font-size="{EmailTheme.BrandFontSize}" font-weight="700" line-height="{EmailTheme.LogoSize}px" padding="0"><img src="{Encode(logoUrl)}" alt="" width="{EmailTheme.LogoSize}" height="{EmailTheme.LogoSize}" style="vertical-align: middle; border: 0;" />&#160;<span style="vertical-align: middle;">Fate<span style="color: {EmailTheme.BrandAccent};">C</span>onnect</span></mj-text>
                  </mj-column>
                </mj-section>
                <mj-section padding="{EmailTheme.BodyPadding}">
                  <mj-column>
                    <mj-text font-size="{EmailTheme.GreetingFontSize}" font-weight="700">Olá, {Encode(fullName)}.</mj-text>
                    {body}
                    <mj-button href="{safeLink}" background-color="{EmailTheme.Button}" color="{EmailTheme.ButtonText}" font-size="{EmailTheme.BodyFontSize}" border-radius="{EmailTheme.ButtonRadius}" inner-padding="{EmailTheme.ButtonInnerPadding}" padding="{EmailTheme.ButtonPadding}">{Encode(email.ActionLabel)}</mj-button>
                    <mj-text color="{EmailTheme.MutedText}" font-size="{EmailTheme.SmallFontSize}">{BrokenButtonHint}<br /><a href="{safeLink}" style="color: {EmailTheme.Button}; word-break: break-all;">{safeLink}</a></mj-text>
                    <mj-text padding="0">{Encode(email.IfItWasNotYou)}</mj-text>
                  </mj-column>
                </mj-section>
                <mj-section full-width="full-width" background-color="{EmailTheme.Chrome}" padding="{EmailTheme.ChromePadding}">
                  <mj-column>
                    <mj-text color="{EmailTheme.ChromeMutedText}" font-size="{EmailTheme.FooterFontSize}" align="center" padding="0">{AutomaticNotice}<br />{Copyright(year)}</mj-text>
                  </mj-column>
                </mj-section>
              </mj-body>
            </mjml>
            """;

        return Renderer.Render(mjml, Options).Html;
    }

    public static string Text(AccountEmail email, string fullName, string link, int year)
    {
        IEnumerable<string> blocks =
        [
            $"Olá, {fullName}.",
            .. email.ParagraphsPointingTo(AccountEmails.LinkPointer),
            $"{email.ActionLabel}: {link}",
            email.IfItWasNotYou,
            $"{AutomaticNotice}\n{Copyright(year)}",
        ];

        return string.Join("\n\n", blocks);
    }

    private static string Paragraph(string text) => $"<mj-text>{text}</mj-text>";

    private static string Encode(string text) => WebUtility.HtmlEncode(text);

    private static string Copyright(int year) =>
        $"© {year.ToString(CultureInfo.InvariantCulture)} FateConnect. Todos os direitos reservados.";
}
