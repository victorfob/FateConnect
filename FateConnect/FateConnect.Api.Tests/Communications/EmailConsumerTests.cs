using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Communications.Consumers;
using FateConnect.Api.Modules.Communications.Interfaces;
using MassTransit;
using MassTransit.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.Communications;

public class EmailConsumerTests
{
    private const string FatecEmail = "lucas+teste@aluno.cps.sp.gov.br";

    private static readonly TimeSpan TestTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan InactivityTimeout = TimeSpan.FromSeconds(10);

    private sealed class FailingEmailService : IEmailService
    {
        public Task SendConfirmationEmailAsync(string toEmail, string fullName, string confirmationLink) =>
            throw new HttpRequestException("Resend fora do ar");

        public Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetLink) =>
            throw new HttpRequestException("Resend fora do ar");

        public Task SendAccountLockedEmailAsync(string toEmail, string fullName, string unlockLink) =>
            throw new HttpRequestException("Resend fora do ar");
    }

    private static async Task<ITestHarness> StartedHarness(IEmailService emailService, string? publicUrl)
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["PUBLIC_URL"] = publicUrl })
            .Build();

        ServiceProvider provider = new ServiceCollection()
            .AddSingleton(configuration)
            .AddSingleton(emailService)
            .AddLogging()
            .AddMassTransitTestHarness(bus =>
            {
                bus.SetTestTimeouts(TestTimeout, InactivityTimeout);
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
        ITestHarness harness = await StartedHarness(new FailingEmailService(), "https://fateconnect.test");

        await harness.Bus.Publish(message);

        IReceivedMessage received = await harness.Consumed.SelectAsync(consumed => consumed.Exception is not null).First();

        Assert.IsType<HttpRequestException>(received.Exception);
        await harness.Stop();
    }

    [Theory]
    [MemberData(nameof(EveryEvent))]
    public async Task Consume_WithoutThePublicUrl_FaultsTheMessage(object message)
    {
        ITestHarness harness = await StartedHarness(new FailingEmailService(), publicUrl: null);

        await harness.Bus.Publish(message);

        IReceivedMessage received = await harness.Consumed.SelectAsync(consumed => consumed.Exception is not null).First();

        Assert.Contains("PUBLIC_URL", received.Exception!.Message);
        await harness.Stop();
    }
}
