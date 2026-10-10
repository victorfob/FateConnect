using System.Reflection;
using FateConnect.Api.Modules.Communications.Exceptions;
using FateConnect.Api.Modules.Communications.Interfaces;
using FateConnect.Api.Modules.Communications.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Resend;

namespace FateConnect.Api.Tests.Communications;

public class EmailServiceTests
{
    private const string Sender = "nao-responda@fateconnect.test";
    private const string Recipient = "lucas.teixeira@aluno.cps.sp.gov.br";
    private const string Link = "https://fateconnect.test/rota?token=abc123";

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

    private static IConfiguration ConfigurationWith(string? sender) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["EMAIL_SENDER"] = sender })
            .Build();

    private static (IEmailService Service, ResendRecorder Recorder) ServiceWithRecorder()
    {
        IResend resend = DispatchProxy.Create<IResend, ResendRecorder>();

        return (new EmailService(resend, ConfigurationWith(Sender), NullLogger<EmailService>.Instance), (ResendRecorder)resend);
    }

    public static TheoryData<string, Func<IEmailService, Task>> EveryEmail => new()
    {
        { "Confirme sua conta no FateConnect", service => service.SendConfirmationEmailAsync(Recipient, "Lucas Teixeira", Link) },
        { "Redefinição de Senha - FateConnect", service => service.SendPasswordResetEmailAsync(Recipient, "Lucas Teixeira", Link) },
        { "Sua conta foi bloqueada - FateConnect", service => service.SendAccountLockedEmailAsync(Recipient, "Lucas Teixeira", Link) },
    };

    [Theory]
    [MemberData(nameof(EveryEmail))]
    public async Task Send_GoesFromTheSenderToTheRecipientCarryingTheLink(string subject, Func<IEmailService, Task> send)
    {
        (IEmailService service, ResendRecorder recorder) = ServiceWithRecorder();

        await send(service);

        EmailMessage message = Assert.Single(recorder.Sent);

        Assert.Equal(Sender, message.From.Email);
        Assert.Equal(Recipient, Assert.Single(message.To).Email);
        Assert.Equal(subject, message.Subject);
        Assert.Contains($"href='{Link}'", message.HtmlBody);
        Assert.Contains("Lucas Teixeira", message.HtmlBody);
    }

    [Fact]
    public async Task Send_EscapesTheNameTheAccountTyped()
    {
        const string injectedName = "<a href='https://golpe.test'>Clique</a>";
        (IEmailService service, ResendRecorder recorder) = ServiceWithRecorder();

        await service.SendConfirmationEmailAsync(Recipient, injectedName, Link);
        await service.SendPasswordResetEmailAsync(Recipient, injectedName, Link);
        await service.SendAccountLockedEmailAsync(Recipient, injectedName, Link);

        Assert.Equal(3, recorder.Sent.Count);
        Assert.All(recorder.Sent, message =>
        {
            Assert.DoesNotContain("golpe.test'>", message.HtmlBody);
            Assert.Contains("&lt;a href=", message.HtmlBody);
        });
    }

    [Fact]
    public void Constructor_WithoutTheSender_FailsNamingTheVariable()
    {
        IResend resend = DispatchProxy.Create<IResend, ResendRecorder>();

        MissingCommunicationConfigurationException exception = Assert.Throws<MissingCommunicationConfigurationException>(
            () => new EmailService(resend, ConfigurationWith(null), NullLogger<EmailService>.Instance));

        Assert.Contains("EMAIL_SENDER", exception.Message);
    }
}
