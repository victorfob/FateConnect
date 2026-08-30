using FateConnect.Api.Modules.Auth.DTOs;

namespace FateConnect.Api.Modules.Auth.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
}
