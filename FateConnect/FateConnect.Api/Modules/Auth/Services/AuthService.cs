namespace FateConnect.Api.Modules.Auth.Services;

using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Auth.Utils;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using static BCrypt.Net.BCrypt;

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
        {
            await userRepository.ReactivateAsync(user.Id);
            LogUserReactivated(logger, user.Id);
        }

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

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        if (user.IsLocked(now))
        {
            int minutesRemaining = (int)Math.Ceiling((user.LockedUntil!.Value - now).TotalMinutes);
            throw new AccountLockedException(minutesRemaining);
        }

        bool isPasswordWrong = !Verify(dto.Password, user.Password);

        if (isPasswordWrong)
        {
            await HandleFailedAttemptAsync(user, now);
        }

        user.ResetFailedLoginAttempts();
        await userRepository.SaveChangesAsync();

        if (!user.IsEmailConfirmed)
            throw new EmailNotConfirmedException();

        return user;
    }

    private async Task HandleFailedAttemptAsync(User user, DateTime now)
    {
        user.RegisterFailedLoginAttempt(now);

        if (!user.IsLocked(now))
        {
            await userRepository.SaveChangesAsync();
            throw new InvalidCredentialsException();
        }

        string rawToken = user.IssueToken(EnumTokenType.AccountUnlock, now, TimeSpan.FromMinutes(AuthConstants.LockoutMinutes));

        await publishEndpoint.Publish(new AccountLockedEvent(
            UserId: user.Id,
            FullName: user.FullName,
            FatecEmail: user.FatecEmail,
            UnlockToken: rawToken
        ));

        await userRepository.SaveChangesAsync();

        LogUserLockedOut(logger, user.Id);

        throw new AccountLockedException(AuthConstants.LockoutMinutes);
    }

    public async Task UnlockAccountAsync(UnlockAccountDto dto)
    {
        string tokenHash = TokenHelper.HashToken(dto.Token);

        UserToken? unlockToken = await userRepository.GetTokenAsync(tokenHash);

        bool isInvalidToken = unlockToken is null || unlockToken.Type != EnumTokenType.AccountUnlock;

        if (isInvalidToken)
            throw new InvalidUnlockTokenException();

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        unlockToken!.Validate(now);

        User user = unlockToken.User;

        user.ResetFailedLoginAttempts();
        unlockToken.Consume(now);

        await userRepository.SaveChangesAsync();

        LogUserUnlocked(logger, user.Id);
    }

    private TokenResponseDto IssueToken(User user) =>
        new() { Token = tokenService.GenerateJwtToken(user) };

    public async Task<TokenResponseDto> ConfirmEmailAsync(ConfirmEmailDto dto)
    {
        string tokenHash = TokenHelper.HashToken(dto.Token);

        UserToken? emailToken = await userRepository.GetTokenAsync(tokenHash);

        bool isInvalidToken = emailToken is null || emailToken.Type != EnumTokenType.EmailConfirmation;

        if (isInvalidToken)
            throw new InvalidConfirmationTokenException();

        User user = emailToken!.User;

        if (user.Status is EnumAccountStatus.Banned)
            throw new BannedAccountException();

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        emailToken.Validate(now);

        emailToken.Consume(now);
        user.ConfirmEmail();

        await userRepository.SaveChangesAsync();

        LogEmailConfirmed(logger, user.Id);

        return IssueToken(user);
    }

    public async Task ResendConfirmationEmailAsync(EmailRequestDto dto)
    {
        User? user = await userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null) return;

        if (user.IsEmailConfirmed) return;

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        UserToken? lastToken = user.Tokens
            .Where(t => t.Type == EnumTokenType.EmailConfirmation)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefault();

        bool isCooldownActive = lastToken is not null && (now - lastToken.CreatedAt).TotalMinutes < AuthConstants.ResendCooldownMinutes;

        if (isCooldownActive)
            return;

        var activeTokens = user.Tokens.Where(t =>
            t.Type == EnumTokenType.EmailConfirmation &&
            !t.IsConsumed &&
            t.ExpiresAt > now);

        foreach (var oldToken in activeTokens)
        {
            oldToken.Consume(now);
        }

        string rawToken = user.IssueToken(EnumTokenType.EmailConfirmation, now, TimeSpan.FromHours(AuthConstants.EmailConfirmationHours));

        await publishEndpoint.Publish(new UserRegisteredEvent(
            UserId: user.Id,
            FullName: user.FullName,
            FatecEmail: user.FatecEmail,
            ConfirmationToken: rawToken
        ));

        await userRepository.SaveChangesAsync();

        LogConfirmationEmailResent(logger, user.Id);
    }

    public async Task ForgotPasswordAsync(EmailRequestDto dto)
    {
        User? user = await userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null)
            throw new UserNotFoundException();

        if (user.Status is EnumAccountStatus.Banned)
            return;

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        UserToken? lastToken = user.Tokens
            .Where(t => t.Type == EnumTokenType.PasswordReset)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefault();

        bool isCooldownActive = lastToken is not null && (now - lastToken.CreatedAt).TotalMinutes < AuthConstants.ResendCooldownMinutes;

        if (isCooldownActive)
            return;

        var activeTokens = user.Tokens.Where(t =>
            t.Type == EnumTokenType.PasswordReset &&
            !t.IsConsumed &&
            t.ExpiresAt > now);

        foreach (var oldToken in activeTokens)
        {
            oldToken.Consume(now);
        }

        string rawToken = user.IssueToken(EnumTokenType.PasswordReset, now, TimeSpan.FromMinutes(AuthConstants.PasswordResetMinutes));

        await publishEndpoint.Publish(new PasswordResetRequestedEvent(
            UserId: user.Id,
            FullName: user.FullName,
            FatecEmail: user.FatecEmail,
            ResetToken: rawToken
        ));

        await userRepository.SaveChangesAsync();

        LogPasswordResetRequested(logger, user.Id);
    }

    public async Task VerifyResetTokenAsync(string rawToken)
    {
        await GetValidResetTokenAsync(rawToken);
    }

    private async Task<UserToken> GetValidResetTokenAsync(string rawToken)
    {
        string tokenHash = TokenHelper.HashToken(rawToken);

        UserToken? resetToken = await userRepository.GetTokenAsync(tokenHash);

        bool isInvalidToken = resetToken is null || resetToken.Type != EnumTokenType.PasswordReset;

        if (isInvalidToken)
            throw new InvalidPasswordResetTokenException();

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        resetToken!.Validate(now);

        return resetToken;
    }

    public async Task<TokenResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
    {
        UserToken resetToken = await GetValidResetTokenAsync(dto.Token);
        User user = resetToken.User;

        if (user.Status is EnumAccountStatus.Banned)
            throw new BannedAccountException();

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        string newPasswordHash = HashPassword(dto.NewPassword);

        user.ChangePassword(newPasswordHash);
        resetToken.Consume(now);

        user.ResetFailedLoginAttempts();

        if (!user.IsEmailConfirmed)
        {
            user.ConfirmEmail();
        }

        await userRepository.SaveChangesAsync();

        LogPasswordResetSuccessfully(logger, user.Id);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
            throw new DeactivatedAccountException();

        return IssueToken(user);
    }
}
