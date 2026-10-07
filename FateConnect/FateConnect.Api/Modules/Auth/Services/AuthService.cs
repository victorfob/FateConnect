namespace FateConnect.Api.Modules.Auth.Services;

using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using static BCrypt.Net.BCrypt;

public partial class AuthService(
    IUserRepository userRepository,
    ITokenService tokenService,
    TimeProvider timeProvider,
    ILogger<AuthService> logger
) : IAuthService
{
    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        User user = await AuthenticateAsync(dto);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
            throw new DeactivatedAccountException();

        LogUserLoggedIn(logger, user.Id);

        return IssueToken(user);
    }

    public async Task<TokenResponseDto> ReactivateAsync(LoginDto dto)
    {
        User user = await AuthenticateAsync(dto);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
            await userRepository.ReactivateAsync(user.Id);

        LogUserReactivated(logger, user.Id);

        return IssueToken(user);
    }

    public async Task LogoutAsync(int userId)
    {
        await userRepository.IncrementTokenVersionAsync(userId);

        LogUserLoggedOut(logger, userId);
    }

    private async Task<User> AuthenticateAsync(LoginDto dto)
    {
        User? user = await userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null)
            throw new InvalidCredentialsException();

        if (user.Status is EnumAccountStatus.Banned)
            throw new BannedAccountException();

        bool isPasswordWrong = !Verify(dto.Password, user.Password);

        if (isPasswordWrong)
            throw new InvalidCredentialsException();

        if (!user.IsEmailConfirmed)
            throw new EmailNotConfirmedException();

        return user;
    }

    private TokenResponseDto IssueToken(User user) =>
        new() { Token = tokenService.GenerateJwtToken(user) };

    public async Task<TokenResponseDto> ConfirmEmailAsync(ConfirmEmailDto dto)
    {
        User? user = await userRepository.GetByConfirmationTokenAsync(dto.Token);

        if (user is null)
            throw new InvalidConfirmationTokenException();

        UserToken emailToken = user.Tokens.First(t =>
            t.Token == dto.Token &&
            t.Type == EnumTokenType.EmailConfirmation);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        if (emailToken.IsConsumed)
            throw new EmailAlreadyConfirmedException();

        if (emailToken.ExpiresAt < now)
            throw new ExpiredConfirmationTokenException();

        emailToken.Consume(now);
        user.ConfirmEmail();

        await userRepository.SaveChangesAsync();

        LogEmailConfirmed(logger, user.Id);

        return IssueToken(user);
    }
}
