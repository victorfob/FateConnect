namespace FateConnect.Api.Modules.Users.Interfaces;

using FateConnect.Api.Modules.Users.Entities;

public interface IPublicationModerationService
{
    Task RecordRemovalAsync(int administratorId, PublicationRemoval removal);
}
