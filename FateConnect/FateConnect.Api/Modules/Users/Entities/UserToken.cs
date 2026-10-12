namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using System;

public class UserToken
{
    public int Id { get; init; }
    public int UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public EnumTokenType Type { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime? ConsumedAt { get; private set; }

    public User User { get; private set; } = null!;

    public bool IsConsumed => ConsumedAt is not null;

    protected UserToken() { }

    public UserToken(int userId, string token, EnumTokenType type, DateTime createdAt, DateTime expiresAt)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new InvalidTokenException();

        UserId = userId;
        Token = token.Trim();
        Type = type;
        CreatedAt = createdAt;
        ExpiresAt = expiresAt;
    }

    public void Consume(DateTime now)
    {
        if (IsConsumed)
            return;

        ConsumedAt = now;
    }

    public void Validate(DateTime now)
    {
        if (IsConsumed)
            throw Type switch
            {
                EnumTokenType.EmailConfirmation => new EmailAlreadyConfirmedException(),
                EnumTokenType.PasswordReset => new PasswordResetTokenConsumedException(),
                _ => new InvalidUnlockTokenException()
            };

        if (ExpiresAt < now)
            throw Type switch
            {
                EnumTokenType.EmailConfirmation => new ExpiredConfirmationTokenException(),
                EnumTokenType.PasswordReset => new ExpiredPasswordResetTokenException(),
                _ => new ExpiredUnlockTokenException()
            };
    }
}
