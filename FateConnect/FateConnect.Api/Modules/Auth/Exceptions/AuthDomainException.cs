namespace FateConnect.Api.Modules.Auth.Exceptions;

using System;
using System.Globalization;

public abstract class AuthDomainException(string message) : Exception(message);

public class BannedAccountException()
    : AuthDomainException("This account was banned from the platform.");

public class DeactivatedAccountException()
    : AuthDomainException("This account is deactivated. Reactivate it to sign in.");

public class InvalidCredentialsException()
    : AuthDomainException("Invalid e-mail or password.");

public class EmailNotConfirmedException()
    : AuthDomainException(
        "Confirm your e-mail through the link we sent before signing in.")
{
    public const string ErrorCode = "EmailNotConfirmed";
}

public class UnconfiguredProfileHierarchyException(string profileType)
    : Exception(
        $"The access hierarchy of the profile '{profileType}' is not configured in the AuthorizeProfileAttribute. " +
            "Update the map of allowed profiles.");

public class UnidentifiedTokenException()
    : UnauthorizedAccessException("Session ended. Sign in again to continue.");

public class UnidentifiedUserException()
    : UnauthorizedAccessException("Session expired. Sign in again to continue.");

public class InvalidConfirmationTokenException()
    : AuthDomainException("The confirmation link is invalid or was not found.");

public class EmailAlreadyConfirmedException()
    : AuthDomainException("This e-mail is already confirmed.");

public class ExpiredConfirmationTokenException()
    : AuthDomainException("The confirmation link expired. Ask for a new one.");

public class InvalidPasswordResetTokenException()
    : AuthDomainException("The password reset link is invalid or was not found.");

public class PasswordResetTokenConsumedException()
    : AuthDomainException("This link was already used to reset the password.");

public class ExpiredPasswordResetTokenException()
    : AuthDomainException("The password reset link expired. Ask for a new one.");

public class AccountLockedException : AuthDomainException
{
    public int MinutesRemaining { get; }
    public const string ErrorCode = "AccountLocked";

    public AccountLockedException(int minutesRemaining)
        : base(BuildMessage(minutesRemaining))
    {
        MinutesRemaining = minutesRemaining;
    }

    private static string BuildMessage(int minutes) =>
        "For security, the account was locked after several sign-in attempts with a wrong password. " +
            "To sign in, use the link sent to your Fatec e-mail " +
            $"or wait {MinutesText(minutes)} and try again.";

    private static string MinutesText(int minutes) =>
        minutes == 1 ? "1 minute" : $"{minutes.ToString(CultureInfo.InvariantCulture)} minutes";
}

public class InvalidUnlockTokenException()
    : AuthDomainException("The unlock link is invalid or was not found.");

public class ExpiredUnlockTokenException()
    : AuthDomainException(
        "This link expired. The security wait is over, and you can sign in with your password.");

public class UserNotFoundException()
    : AuthDomainException("There is no account with this e-mail.");
