using System.Net;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Options;
using FateConnect.Api.Modules.Emails.Services;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Resend;

namespace FateConnect.Api.Tests.Emails;

public partial class EmailServiceTests
{
    private const string Sender = "nao-responda@fateconnect.test";
    private const string PublicUrl = "https://fateconnect.test/";
    private const string Recipient = "lucas.teixeira@aluno.cps.sp.gov.br";
    private const string FullName = "Lucas Teixeira";
    private const string Link = "https://fateconnect.test/rota?token=abc123&email=lucas.teixeira%40aluno.cps.sp.gov.br";
    private const int GmailClippingBytes = 102 * 1024;

    private static readonly DateTimeOffset NewYearInUtcStillDecemberInBrazil = new(2032, 1, 1, 1, 0, 0, TimeSpan.Zero);

    public class ResendRecorder : DispatchProxy
    {
        public List<EmailMessage> Sent { get; } = [];

        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args)
        {
            if (targetMethod?.Name == nameof(IResend.EmailSendAsync) && args?[0] is EmailMessage message)
                Sent.Add(message);

            Type resultType = targetMethod!.ReturnType.GetGenericArguments()[0];

            return typeof(Task).GetMethod(nameof(Task.FromResult))!
                .MakeGenericMethod(resultType)
                .Invoke(null, [null]);
        }
    }

    [GeneratedRegex(@"display\s*:\s*(flex|grid)|var\(|box-shadow|<svg", RegexOptions.IgnoreCase)]
    private static partial Regex CssTheClientsIgnore();

    private static EmailService ServiceWith(IResend resend) =>
        new(resend, Options.Create(new EmailOptions(PublicUrl, Sender)), new FixedTimeProvider(NewYearInUtcStillDecemberInBrazil), NullLogger<EmailService>.Instance);

    private static async Task<EmailMessage> SentMessage(EnumAccountEmail email, string fullName = FullName)
    {
        IResend resend = DispatchProxy.Create<IResend, ResendRecorder>();
        EmailService service = ServiceWith(resend);

        await service.SendAsync(email, Recipient, fullName, Link);

        return Assert.Single(((ResendRecorder)resend).Sent);
    }

    public static TheoryData<EnumAccountEmail, string, string> EveryEmail => new()
    {
        { EnumAccountEmail.Confirmation, "Confirme seu e-mail do FateConnect", "Confirmar e-mail" },
        { EnumAccountEmail.PasswordReset, "Redefina sua senha do FateConnect", "Redefinir senha" },
        { EnumAccountEmail.AccountLocked, "Sua conta do FateConnect foi bloqueada por 30 minutos", "Desbloquear conta" },
    };

    public static TheoryData<EnumAccountEmail> EveryKind => new()
    {
        EnumAccountEmail.Confirmation,
        EnumAccountEmail.PasswordReset,
        EnumAccountEmail.AccountLocked,
    };

    [Theory]
    [MemberData(nameof(EveryEmail))]
    public async Task SendAsync_GoesFromTheSenderToTheRecipientCarryingTheLink(EnumAccountEmail email, string subject, string actionLabel)
    {
        EmailMessage message = await SentMessage(email);

        Assert.NotNull(message.From);
        Assert.Equal(Sender, message.From.Email);
        Assert.Equal(Recipient, Assert.Single(message.To).Email);
        Assert.Equal(subject, message.Subject);
        Assert.Contains($"href=\"{WebUtility.HtmlEncode(Link)}\"", message.HtmlBody);
        Assert.Contains(actionLabel, message.HtmlBody);
        Assert.Contains($"Olá, {FullName}.", message.HtmlBody);
    }

    [Theory]
    [MemberData(nameof(EveryEmail))]
    public async Task SendAsync_AlsoSendsAPlainTextVersionPointingToTheLink(EnumAccountEmail email, string subject, string actionLabel)
    {
        EmailMessage message = await SentMessage(email);

        Assert.NotNull(message.TextBody);
        Assert.StartsWith($"Olá, {FullName}.", message.TextBody);
        Assert.Contains($"{actionLabel}: {Link}", message.TextBody);
        Assert.Contains("link abaixo", message.TextBody);
        Assert.DoesNotContain("botão", message.TextBody);
        Assert.DoesNotContain("<", message.TextBody);
        Assert.DoesNotContain(subject, message.TextBody);
    }

    [Theory]
    [MemberData(nameof(EveryKind))]
    public async Task SendAsync_ShowsTheLogoFromTheSiteAndTheYearInTheProductTimeZone(EnumAccountEmail email)
    {
        EmailMessage message = await SentMessage(email);

        Assert.Contains("src=\"https://fateconnect.test/email-logo.png\"", message.HtmlBody);
        Assert.Contains("© 2031 FateConnect", WebUtility.HtmlDecode(message.HtmlBody));
        Assert.Contains("© 2031 FateConnect", message.TextBody);
    }

    [Theory]
    [MemberData(nameof(EveryKind))]
    public async Task SendAsync_WritesOnlyCssThatEveryClientDraws(EnumAccountEmail email)
    {
        EmailMessage message = await SentMessage(email);

        Assert.Empty(CssTheClientsIgnore().Matches(message.HtmlBody!));
        Assert.True(Encoding.UTF8.GetByteCount(message.HtmlBody!) < GmailClippingBytes);
    }

    [Theory]
    [InlineData("<div style=\"display: flex;\">")]
    [InlineData("<div style=\"display:grid\">")]
    [InlineData("<p style=\"color: var(--texto)\">")]
    [InlineData("<td style=\"box-shadow: 0 1px 2px #000\">")]
    [InlineData("<svg viewBox=\"0 0 1 1\"></svg>")]
    public void CssTheClientsIgnore_CatchesEachForbiddenRule(string html) =>
        Assert.Single(CssTheClientsIgnore().Matches(html));

    [Fact]
    public async Task SendAsync_EscapesTheNameTheAccountTyped()
    {
        const string injectedName = "<a href='https://golpe.test'>Clique</a>";

        foreach (EnumAccountEmail email in Enum.GetValues<EnumAccountEmail>())
        {
            EmailMessage message = await SentMessage(email, injectedName);

            Assert.DoesNotContain("<a href='https://golpe.test'", message.HtmlBody);
            Assert.Contains("&lt;a href=", message.HtmlBody);
        }
    }
}
