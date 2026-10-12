namespace FateConnect.Api.Modules.Common.Events;

public record PasswordResetRequestedEvent(
    int UserId,
    string FullName,
    string FatecEmail,
    string ResetToken
);
