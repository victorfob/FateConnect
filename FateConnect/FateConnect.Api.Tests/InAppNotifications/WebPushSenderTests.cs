using System.Net;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.InAppNotifications.Options;
using FateConnect.Api.Modules.InAppNotifications.Services;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WebPush;
using WebPush.Model;

namespace FateConnect.Api.Tests.InAppNotifications;

public class WebPushSenderTests : IClassFixture<ApiFactory>
{
    private const string UnreachableDevicePath = "/send/aparelho-sem-servico";

    private readonly ApiFactory _factory;

    public WebPushSenderTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed class AnsweringHandler(Func<HttpRequestMessage, HttpResponseMessage> answer) : HttpMessageHandler
    {
        public List<HttpRequestMessage> Requests { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Requests.Add(request);

            return Task.FromResult(answer(request));
        }
    }

    private static Api.Modules.InAppNotifications.Entities.PushSubscription Device(
        string endpoint = "https://push.example.com/send/aparelho")
    {
        VapidDetails deviceKeys = VapidHelper.GenerateVapidKeys();
        string auth = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        return new Api.Modules.InAppNotifications.Entities.PushSubscription(
            7,
            endpoint,
            deviceKeys.PublicKey,
            auth,
            DateTime.UtcNow);
    }

    private static WebPushSender SenderAnswering(AnsweringHandler handler) => SenderOver(new HttpClient(handler));

    private static WebPushSender SenderOver(HttpClient client)
    {
        VapidDetails vapid = VapidHelper.GenerateVapidKeys();

        return new WebPushSender(
            client,
            Options.Create(new PushOptions("https://fateconnect.test/", vapid.PublicKey, vapid.PrivateKey)));
    }

    private async Task<int> LogLinesWithTheDeviceAfterSendingThroughAsync(string clientName)
    {
        HttpClient client = _factory.Services.GetRequiredService<IHttpClientFactory>().CreateClient(clientName);
        using WebPushSender sender = SenderOver(client);
        string endpoint = $"https://127.0.0.1:1{UnreachableDevicePath}/{Guid.NewGuid():N}";

        await sender.SendAsync(Device(endpoint), "{\"id\":1}");

        return _factory.LogMessages.Count(message => message.Contains(endpoint, StringComparison.Ordinal));
    }

    [Theory]
    [InlineData(HttpStatusCode.Created, EnumPushDelivery.Delivered)]
    [InlineData(HttpStatusCode.Gone, EnumPushDelivery.Gone)]
    [InlineData(HttpStatusCode.NotFound, EnumPushDelivery.Gone)]
    [InlineData(HttpStatusCode.InternalServerError, EnumPushDelivery.Failed)]
    [InlineData(HttpStatusCode.TooManyRequests, EnumPushDelivery.Failed)]
    public async Task SendAsync_ByTheAnswerOfThePushService_TellsWhatHappened(HttpStatusCode status, EnumPushDelivery expected)
    {
        AnsweringHandler handler = new(_ => new HttpResponseMessage(status));
        using WebPushSender sender = SenderAnswering(handler);

        EnumPushDelivery delivery = await sender.SendAsync(Device(), "{\"id\":1}");

        Assert.Equal(expected, delivery);
        HttpRequestMessage request = Assert.Single(handler.Requests);
        Assert.Equal("https://push.example.com/send/aparelho", request.RequestUri?.ToString());
        Assert.StartsWith("vapid", request.Headers.Authorization?.ToString(), StringComparison.Ordinal);
        Assert.Equal("aes128gcm", Assert.Single(request.Content!.Headers.ContentEncoding));
    }

    [Fact]
    public async Task SendAsync_WhenTheServiceIsUnreachable_AnswersFailed()
    {
        AnsweringHandler handler = new(_ => throw new HttpRequestException("Sem conexão"));
        using WebPushSender sender = SenderAnswering(handler);

        EnumPushDelivery delivery = await sender.SendAsync(Device(), "{\"id\":1}");

        Assert.Equal(EnumPushDelivery.Failed, delivery);
    }

    [Fact]
    public async Task SendAsync_ThroughTheClientTheApiRegisters_LeavesTheDeviceAddressOutOfTheLog()
    {
        int lines = await LogLinesWithTheDeviceAfterSendingThroughAsync(nameof(IPushSender));

        Assert.Equal(0, lines);
    }

    [Fact]
    public async Task SendAsync_ThroughAClientWithTheDefaultLogging_WritesTheDeviceAddress()
    {
        int lines = await LogLinesWithTheDeviceAfterSendingThroughAsync("cliente-com-log-padrao");

        Assert.True(lines > 0);
    }
}
