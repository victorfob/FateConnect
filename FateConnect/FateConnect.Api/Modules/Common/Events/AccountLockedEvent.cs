namespace FateConnect.Api.Modules.Common.Events;

public record AccountLockedEvent(
    int UserId,
    string FullName,
    string FatecEmail,
    string UnlockToken
);
