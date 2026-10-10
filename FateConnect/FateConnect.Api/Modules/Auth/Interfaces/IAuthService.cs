using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.Entities;

namespace FateConnect.Api.Modules.Auth.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> ConfirmEmailAsync(ConfirmEmailDto dto);
    Task ResendConfirmationEmailAsync(EmailRequestDto dto);
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
    Task<TokenResponseDto> ReactivateAsync(LoginDto dto);
    Task LogoutAsync(int userId);
    Task ForgotPasswordAsync(EmailRequestDto dto);
    Task<User> VerifyResetTokenAsync(string rawToken);
    Task<TokenResponseDto> ResetPasswordAsync(ResetPasswordDto dto);
    Task UnlockAccountAsync(UnlockAccountDto dto);
}
