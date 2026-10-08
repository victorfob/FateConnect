using FateConnect.Api.Modules.Auth.DTOs;

namespace FateConnect.Api.Modules.Auth.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> ConfirmEmailAsync(ConfirmEmailDto dto);
    Task ResendConfirmationEmailAsync(ResendConfirmationEmailDto dto);
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
    Task<TokenResponseDto> ReactivateAsync(LoginDto dto);
    Task LogoutAsync(int userId);
}
