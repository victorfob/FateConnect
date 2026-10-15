namespace FateConnect.Api.Modules.Users.Services;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using MassTransit;

public class PublicationModerationService(
    IUserRepository userRepository,
    IPublishEndpoint publishEndpoint,
    TimeProvider clock
) : IPublicationModerationService
{
    public async Task RecordRemovalAsync(int administratorId, PublicationRemoval removal)
    {
        userRepository.AddAdministrativeAction(AdministrativeAction.ForRemoval(
            administratorId,
            RemovalActionOf(removal.Publication),
            removal,
            clock.GetUtcNow().UtcDateTime));

        await publishEndpoint.Publish(new PublicationRemovedEvent(
            removal.OwnerId,
            removal.PublicationId,
            removal.Publication,
            removal.Title,
            removal.Reason));
    }

    private static EnumAdministrativeAction RemovalActionOf(EnumPublication publication) => publication switch
    {
        EnumPublication.Ride => EnumAdministrativeAction.RideRemoved,
        EnumPublication.LostAndFoundItem => EnumAdministrativeAction.LostAndFoundItemRemoved,
        _ => throw new ArgumentOutOfRangeException(nameof(publication), publication, "Only rides and items are removed.")
    };
}
