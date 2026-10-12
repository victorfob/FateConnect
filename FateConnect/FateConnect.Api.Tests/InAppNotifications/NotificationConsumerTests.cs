using System.Reflection;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.InAppNotifications.Consumers;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Hubs;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using MassTransit.Testing;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.InAppNotifications;

public class NotificationConsumerTests
{
    private static readonly TimeSpan TestTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan InactivityTimeout = TimeSpan.FromSeconds(10);

    public class OutOfServiceProxy : DispatchProxy
    {
        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) =>
            throw new InvalidOperationException("Dependência fora do ar");
    }

    private static T OutOfService<T>() where T : class => DispatchProxy.Create<T, OutOfServiceProxy>();

    private static async Task<ITestHarness> StartedHarness()
    {
        ServiceProvider provider = new ServiceCollection()
            .AddSingleton(OutOfService<IInAppNotificationRepository>())
            .AddSingleton(OutOfService<IInAppNotificationService>())
            .AddSingleton(OutOfService<IHubContext<NotificationHub>>())
            .AddLogging()
            .AddMassTransitTestHarness(bus =>
            {
                bus.SetTestTimeouts(TestTimeout, InactivityTimeout);
                bus.AddConsumer<RideCreatedEventConsumer>();
                bus.AddConsumer<DenunciationReceivedEventConsumer>();
                bus.AddConsumer<ItemArchivedEventConsumer>();
                bus.AddConsumer<NotificationDispatchedEventConsumer>();
            })
            .BuildServiceProvider(true);

        ITestHarness harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();

        return harness;
    }

    public static TheoryData<object> EveryEvent => new()
    {
        new RideCreatedEvent(Guid.NewGuid(), 7, "Rua das Flores, Vila Hortência"),
        new DenunciationReceivedEvent(7, Guid.NewGuid(), EnumDenunciationCategory.RecklessDriving),
        new ItemArchivedEvent(7, Guid.NewGuid(), "Garrafa térmica azul"),
        new NotificationDispatchedEvent(
            new ReadInAppNotificationDto(3, EnumInAppNotificationType.ItemArchived, "Seu item foi arquivado.", null, false, DateTime.UtcNow),
            7),
    };

    [Theory]
    [MemberData(nameof(EveryEvent))]
    public async Task Consume_WhenADependencyFails_FaultsTheMessage(object message)
    {
        ITestHarness harness = await StartedHarness();

        await harness.Bus.Publish(message);

        IReceivedMessage received = await harness.Consumed.SelectAsync(consumed => consumed.Exception is not null).First();

        Assert.IsType<InvalidOperationException>(received.Exception);
        await harness.Stop();
    }
}
