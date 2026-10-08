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
using MassTransit;
using FateConnect.Api.Modules.Common.Events;

public partial class AuthService(
    IUserRepository userRepository,
    ITokenService tokenService,
    TimeProvider timeProvider,
    IPublishEndpoint publishEndpoint,
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
        User? user = await userRepository.GetByTokenAsync(dto.Token);

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

    public async Task ResendConfirmationEmailAsync(EmailRequestDto dto)
    {
        User? user = await userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null)
            return;

        if (user.IsEmailConfirmed)
            throw new EmailAlreadyConfirmedException();

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        var activeTokens = user.Tokens.Where(t =>
            t.Type == EnumTokenType.EmailConfirmation &&
            !t.IsConsumed &&
            t.ExpiresAt > now);

        foreach (var oldToken in activeTokens)
        {
            oldToken.Consume(now);
        }

        string newRawToken = Guid.NewGuid().ToString("N");
        DateTime expiration = now.AddHours(8);

        var token = new UserToken(
            userId: user.Id,
            token: newRawToken,
            type: EnumTokenType.EmailConfirmation,
            createdAt: now,
            expiresAt: expiration
        );

        user.AddToken(token);

        await userRepository.SaveChangesAsync();

        await publishEndpoint.Publish(new UserRegisteredEvent(
            UserId: user.Id,
            FullName: user.FullName,
            FatecEmail: user.FatecEmail,
            ConfirmationToken: newRawToken
        ));

        LogConfirmationEmailResent(logger, user.Id);
    }

    public async Task ForgotPasswordAsync(EmailRequestDto dto)
    {
        User? user = await userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null)
            return;

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        var activeTokens = user.Tokens.Where(t =>
            t.Type == EnumTokenType.PasswordReset &&
            !t.IsConsumed &&
            t.ExpiresAt > now);

        foreach (var oldToken in activeTokens)
        {
            oldToken.Consume(now);
        }

        string newRawToken = Guid.NewGuid().ToString("N");
        DateTime expiration = now.AddMinutes(30);

        var token = new UserToken(
            userId: user.Id,
            token: newRawToken,
            type: EnumTokenType.PasswordReset,
            createdAt: now,
            expiresAt: expiration
        );

        user.AddToken(token);

        await userRepository.SaveChangesAsync();

        await publishEndpoint.Publish(new PasswordResetRequestedEvent(
            UserId: user.Id,
            FullName: user.FullName,
            FatecEmail: user.FatecEmail,
            ResetToken: newRawToken
        ));

        LogPasswordResetRequested(logger, user.Id);
    }

    public async Task<User> VerifyResetTokenAsync(string token)
    {
        User? user = await userRepository.GetByTokenAsync(token);

        if (user is null)
            throw new InvalidPasswordResetTokenException();

        UserToken? resetToken = user.Tokens.FirstOrDefault(t =>
            t.Token == token &&
            t.Type == EnumTokenType.PasswordReset);

        if (resetToken is null)
            throw new InvalidPasswordResetTokenException();

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        if (resetToken.IsConsumed)
            throw new PasswordResetTokenConsumedException();

        if (resetToken.ExpiresAt < now)
            throw new ExpiredPasswordResetTokenException();

        return user;
    }

    public async Task<TokenResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
    {
        User user = await VerifyResetTokenAsync(dto.Token);

        UserToken resetToken = user.Tokens.First(t => t.Token == dto.Token && t.Type == EnumTokenType.PasswordReset);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        string newPasswordHash = HashPassword(dto.NewPassword);
        user.ChangePassword(newPasswordHash);

        resetToken.Consume(now);

        await userRepository.SaveChangesAsync();

        LogPasswordResetSuccessfully(logger, user.Id);

        return IssueToken(user);
    }
}
