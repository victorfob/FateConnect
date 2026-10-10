namespace FateConnect.Api.Modules.Auth.Constants;

public static class AuthConstants
{
    public const int MaxFailedLoginAttempts = 3;
    public const int LockoutMinutes = 30;
    public const int PasswordResetMinutes = 30;
    public const int EmailConfirmationHours = 8;
    public const int ResendCooldownMinutes = 1;
}
