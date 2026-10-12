namespace FateConnect.Api.Modules.Common.Events;

public record UserRegisteredEvent(
    int UserId,
    string FullName,
    string FatecEmail,
    string ConfirmationToken
);
