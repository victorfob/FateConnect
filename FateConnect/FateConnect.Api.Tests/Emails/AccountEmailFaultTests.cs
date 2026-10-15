using System.Text.Json;
using System.Text.Json.Nodes;
using FateConnect.Api.Modules.Emails.Consumers;
using FateConnect.Api.Modules.InAppNotifications.Consumers;
using FateConnect.Api.Tests.Fixtures;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.Emails;

public class AccountEmailFaultTests : IClassFixture<ApiFactory>
{
    private const string RescueFilter = "rescue";

    private readonly IReadOnlyDictionary<string, string> _faultFilterByConsumer;

    public AccountEmailFaultTests(ApiFactory factory)
    {
        _ = factory.CreateClient();
        _faultFilterByConsumer = FaultFilterByConsumer(factory.Services.GetRequiredService<IBusControl>());
    }

    private static Dictionary<string, string> FaultFilterByConsumer(IBusControl bus)
    {
        JsonNode probe = JsonNode.Parse(JsonSerializer.Serialize(bus.GetProbeResult().Results))!;
        JsonArray endpoints = probe["bus"]!["host"]!["receiveEndpoint"]!.AsArray();
        Dictionary<string, string> filters = [];

        foreach (JsonNode? endpoint in endpoints)
        {
            List<JsonObject> nodes = [.. ObjectsIn(endpoint)];
            string? consumer = nodes
                .Select(node => node["consumer"]?["type"]?.GetValue<string>())
                .FirstOrDefault(type => type is not null);

            if (consumer is null)
                continue;

            JsonObject rescue = nodes.First(node => node["filterType"]?.GetValue<string>() == RescueFilter);
            JsonArray rescueFilters = rescue["filters"]!.AsArray();
            filters[consumer] = rescueFilters[rescueFilters.Count - 1]!["filterType"]!.GetValue<string>();
        }

        return filters;
    }

    private static IEnumerable<JsonObject> ObjectsIn(JsonNode? node)
    {
        if (node is JsonObject jsonObject)
        {
            yield return jsonObject;

            foreach (KeyValuePair<string, JsonNode?> property in jsonObject)
            {
                foreach (JsonObject child in ObjectsIn(property.Value))
                    yield return child;
            }
        }

        if (node is not JsonArray array)
            yield break;

        foreach (JsonNode? item in array)
        {
            foreach (JsonObject child in ObjectsIn(item))
                yield return child;
        }
    }

    [Theory]
    [InlineData(typeof(UserRegisteredEventConsumer))]
    [InlineData(typeof(PasswordResetRequestedEventConsumer))]
    [InlineData(typeof(AccountLockedEventConsumer))]
    public void AccountEmailEndpoint_WhenTheSendKeepsFailing_DiscardsTheMessage(Type consumer)
    {
        Assert.Equal("discardFault", _faultFilterByConsumer[consumer.FullName!]);
    }

    [Fact]
    public void NotificationEndpoint_WhenTheConsumerKeepsFailing_KeepsTheMessageInTheErrorQueue()
    {
        Assert.Equal("moveFault", _faultFilterByConsumer[typeof(RideCreatedEventConsumer).FullName!]);
    }
}
