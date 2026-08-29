using FateConnect.Api.Modules.Users.DTOs;

namespace FateConnect.Api.Modules.Users.Services;

public interface IUserService
{
    Task<UsuarioResponseDto> CadastrarAsync(CreateUsuarioDto dto);
}
