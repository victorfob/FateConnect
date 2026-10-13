using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Emails.Consumers;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Interfaces;
using MassTransit;
using MassTransit.Testing;
using FateConnect.Api.Modules.Emails.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FateConnect.Api.Tests.Emails;

public class EmailConsumerTests
{
    private const string FatecEmail = "lucas+teste@aluno.cps.sp.gov.br";

    private static readonly TimeSpan TestTimeout = TimeSpan.FromSeconds(30);

    private sealed class FailingEmailService : IEmailService
    {
        public Task SendAsync(EnumAccountEmail email, string toEmail, string fullName, string link) =>
            throw new HttpRequestException("Resend fora do ar");
    }

    private static async Task<ITestHarness> StartedHarness(IEmailService emailService)
    {
        ServiceProvider provider = new ServiceCollection()
            .AddSingleton(Options.Create(new EmailOptions("https://fateconnect.test", "nao-responda@fateconnect.test")))
            .AddSingleton(emailService)
            .AddLogging()
            .AddMassTransitTestHarness(bus =>
            {
                bus.SetTestTimeouts(TestTimeout, testInactivityTimeout: TestTimeout);
                bus.AddConsumer<UserRegisteredEventConsumer>();
                bus.AddConsumer<PasswordResetRequestedEventConsumer>();
                bus.AddConsumer<AccountLockedEventConsumer>();
            })
            .BuildServiceProvider(true);

        ITestHarness harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();

        return harness;
    }

    public static TheoryData<object> EveryEvent => new()
    {
        new UserRegisteredEvent(7, "Lucas Teixeira", FatecEmail, "token-de-confirmacao"),
        new PasswordResetRequestedEvent(7, "Lucas Teixeira", FatecEmail, "token-de-redefinicao"),
        new AccountLockedEvent(7, "Lucas Teixeira", FatecEmail, "token-de-desbloqueio"),
    };

    [Theory]
    [MemberData(nameof(EveryEvent))]
    public async Task Consume_WhenTheSendFails_FaultsTheMessage(object message)
    {
        ITestHarness harness = await StartedHarness(new FailingEmailService());

        await harness.Bus.Publish(message);

        IReceivedMessage received = await harness.Consumed.SelectAsync(consumed => consumed.Exception is not null).First();

        Assert.IsType<HttpRequestException>(received.Exception);
        await harness.Stop();
    }
}
