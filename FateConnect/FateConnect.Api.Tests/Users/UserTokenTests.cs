using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;

namespace FateConnect.Api.Tests.Users;

public class UserTokenTests
{
    private static readonly DateTime IssuedAt = new(2026, 10, 10, 12, 0, 0, DateTimeKind.Utc);

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WithABlankToken_IsRefused(string token)
    {
        Assert.Throws<InvalidTokenException>(
            () => new UserToken(1, token, EnumTokenType.EmailConfirmation, IssuedAt, IssuedAt.AddHours(8)));
    }

    [Fact]
    public void Consume_TwiceKeepsTheFirstMoment()
    {
        UserToken token = new(1, "resumo-do-token", EnumTokenType.PasswordReset, IssuedAt, IssuedAt.AddMinutes(30));

        token.Consume(IssuedAt.AddMinutes(5));
        token.Consume(IssuedAt.AddMinutes(10));

        Assert.Equal(IssuedAt.AddMinutes(5), token.ConsumedAt);
    }
}
