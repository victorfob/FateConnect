namespace FateConnect.Api.Modules.Auth.Services;

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Enums;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Auth.Utils;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Hubs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using static BCrypt.Net.BCrypt;

public partial class AuthService(
    IUserRepository userRepository,
    ITokenService tokenService,
    TimeProvider timeProvider,
    IPublishEndpoint publishEndpoint,
    IHubContext<NotificationHub> hubContext,
    ILogger<AuthService> logger
) : IAuthService
{
    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        User user = await AuthenticateAsync(dto);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
        {
            LogLoginRefused(logger, user.Id, EnumLoginRefusalReason.Deactivated);
            throw new DeactivatedAccountException();
        }

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

        await hubContext.Clients
            .User(userId.ToString(CultureInfo.InvariantCulture))
            .SendAsync(NotificationHub.SessionRevokedEvent);

        LogUserLoggedOut(logger, userId);
    }

    private async Task<User> AuthenticateAsync(LoginDto dto)
    {
        User? user = await userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null)
        {
            LogLoginRefusedForUnknownEmail(logger);
            throw new InvalidCredentialsException();
        }

        if (user.Status is EnumAccountStatus.Banned)
        {
            LogLoginRefused(logger, user.Id, EnumLoginRefusalReason.Banned);
            throw new BannedAccountException();
        }

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        if (user.IsLocked(now))
        {
            LogLoginRefused(logger, user.Id, EnumLoginRefusalReason.Locked);
            int minutesRemaining = (int)Math.Ceiling((user.LockedUntil!.Value - now).TotalMinutes);
            throw new AccountLockedException(minutesRemaining);
        }

        bool isPasswordWrong = !Verify(dto.Password, user.Password);

        if (isPasswordWrong)
        {
            await HandleFailedAttemptAsync(user, now);
        }

        user.ResetFailedLoginAttempts(now);
        await userRepository.SaveChangesAsync();

        if (!user.IsEmailConfirmed)
        {
            LogLoginRefused(logger, user.Id, EnumLoginRefusalReason.EmailNotConfirmed);
            throw new EmailNotConfirmedException();
        }

        return user;
    }

    private async Task HandleFailedAttemptAsync(User user, DateTime now)
    {
        user.RegisterFailedLoginAttempt(now);

        if (!user.IsLocked(now))
        {
            await userRepository.SaveChangesAsync();
            LogLoginRefused(logger, user.Id, EnumLoginRefusalReason.WrongPassword);
            throw new InvalidCredentialsException();
        }

        string rawToken = user.IssueToken(
            EnumTokenType.AccountUnlock,
            now,
            TimeSpan.FromMinutes(AuthConstants.LockoutMinutes));

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
        UserToken unlockToken = await GetValidTokenAsync(
            dto.Token,
            EnumTokenType.AccountUnlock,
            refusesBannedAccount: false);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        User user = unlockToken.User;

        user.ResetFailedLoginAttempts(now);
        unlockToken.Consume(now);

        await userRepository.SaveChangesAsync();

        LogUserUnlocked(logger, user.Id);
    }

    private TokenResponseDto IssueToken(User user) =>
        new() { Token = tokenService.GenerateJwtToken(user) };

    public async Task<TokenResponseDto> ConfirmEmailAsync(ConfirmEmailDto dto)
    {
        UserToken emailToken = await GetValidTokenAsync(
            dto.Token,
            EnumTokenType.EmailConfirmation,
            refusesBannedAccount: true);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        User user = emailToken.User;

        emailToken.Consume(now);
        user.ConfirmEmail(now);

        await userRepository.SaveChangesAsync();

        LogEmailConfirmed(logger, user.Id);

        return IssueToken(user);
    }

    public async Task ResendConfirmationEmailAsync(EmailRequestDto dto)
    {
        User? user = await userRepository.GetByEmailWithTokensAsync(dto.FatecEmail, EnumTokenType.EmailConfirmation);

        if (user is null)
        {
            LogLinkRequestForUnknownEmail(logger, EnumTokenType.EmailConfirmation);
            return;
        }

        if (user.IsEmailConfirmed)
        {
            LogLinkRequestSkipped(
                logger,
                EnumTokenType.EmailConfirmation,
                user.Id,
                EnumLinkRequestSkipReason.AlreadyConfirmed);
            return;
        }

        bool isReissued = TryReissueToken(
            user,
            EnumTokenType.EmailConfirmation,
            TimeSpan.FromHours(AuthConstants.EmailConfirmationHours),
            out string rawToken);

        if (!isReissued)
            return;

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
        User? user = await userRepository.GetByEmailWithTokensAsync(dto.FatecEmail, EnumTokenType.PasswordReset);

        if (user is null)
        {
            LogLinkRequestForUnknownEmail(logger, EnumTokenType.PasswordReset);
            throw new UserNotFoundException();
        }

        if (user.Status is EnumAccountStatus.Banned)
        {
            LogLinkRequestSkipped(logger, EnumTokenType.PasswordReset, user.Id, EnumLinkRequestSkipReason.Banned);
            return;
        }

        bool isReissued = TryReissueToken(
            user,
            EnumTokenType.PasswordReset,
            TimeSpan.FromMinutes(AuthConstants.PasswordResetMinutes),
            out string rawToken);

        if (!isReissued)
            return;

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
        await GetValidTokenAsync(rawToken, EnumTokenType.PasswordReset, refusesBannedAccount: false);
    }

    private async Task<UserToken> GetValidTokenAsync(string rawToken, EnumTokenType type, bool refusesBannedAccount)
    {
        UserToken? token = await userRepository.GetTokenAsync(TokenHelper.HashToken(rawToken));

        bool isInvalidToken = token is null || token.Type != type;

        if (isInvalidToken)
            throw type switch
            {
                EnumTokenType.EmailConfirmation => new InvalidConfirmationTokenException(),
                EnumTokenType.PasswordReset => new InvalidPasswordResetTokenException(),
                _ => new InvalidUnlockTokenException()
            };

        if (refusesBannedAccount && token!.User.Status is EnumAccountStatus.Banned)
            throw new BannedAccountException();

        token!.Validate(timeProvider.GetUtcNow().UtcDateTime);

        return token;
    }

    private bool TryReissueToken(User user, EnumTokenType type, TimeSpan lifetime, out string rawToken)
    {
        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        UserToken? lastToken = user.Tokens
            .Where(t => t.Type == type)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefault();

        bool isCooldownActive = lastToken is not null
            && (now - lastToken.CreatedAt).TotalMinutes < AuthConstants.ResendCooldownMinutes;

        if (isCooldownActive)
        {
            LogLinkRequestSkipped(logger, type, user.Id, EnumLinkRequestSkipReason.Cooldown);
            rawToken = string.Empty;

            return false;
        }

        IEnumerable<UserToken> activeTokens = user.Tokens.Where(t =>
            t.Type == type &&
            !t.IsConsumed &&
            t.ExpiresAt > now);

        foreach (UserToken oldToken in activeTokens)
            oldToken.Consume(now);

        rawToken = user.IssueToken(type, now, lifetime);

        return true;
    }

    public async Task<TokenResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
    {
        UserToken resetToken = await GetValidTokenAsync(
            dto.Token,
            EnumTokenType.PasswordReset,
            refusesBannedAccount: true);
        User user = resetToken.User;

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        string newPasswordHash = HashPassword(dto.NewPassword);

        user.ChangePassword(newPasswordHash, now);
        resetToken.Consume(now);

        user.ResetFailedLoginAttempts(now);

        if (!user.IsEmailConfirmed)
        {
            user.ConfirmEmail(now);
        }

        await userRepository.SaveChangesAsync();

        LogPasswordResetSuccessfully(logger, user.Id);

        await hubContext.Clients
            .User(user.Id.ToString(CultureInfo.InvariantCulture))
            .SendAsync(NotificationHub.SessionRevokedEvent);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
            throw new DeactivatedAccountException();

        return IssueToken(user);
    }
}
