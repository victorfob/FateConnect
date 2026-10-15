using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Users.Services;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.Users;

public class PublicationModerationServiceTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task RecordRemoval_OfAReport_IsRefused()
    {
        using IServiceScope scope = factory.Services.CreateScope();
        PublicationModerationService service = new(
            scope.ServiceProvider.GetRequiredService<IUserRepository>(),
            new NullPublishEndpoint(),
            TimeProvider.System);
        PublicationRemoval removal = new(
            EnumPublication.IdentifiedReport, Guid.NewGuid(), 1, "Denúncia sobre a carona", EnumRemovalReason.Offensive);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => service.RecordRemovalAsync(1, removal));
    }
}
