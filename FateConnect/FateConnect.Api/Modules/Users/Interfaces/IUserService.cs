using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.DTOs;

namespace FateConnect.Api.Modules.Users.Services;

public interface IUserService
{
    Task<TokenResponseDto> SignUpAsync(CreateUserDto dto);
}
