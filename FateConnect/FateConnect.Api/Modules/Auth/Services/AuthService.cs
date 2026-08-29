using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Usuarios.DTOs;
using FateConnect.Api.Modules.Usuarios.Exceptions;
using static BCrypt.Net.BCrypt;

namespace FateConnect.Api.Modules.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _usuarioRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository usuarioRepository, ITokenService tokenService)
    {
        _usuarioRepository = usuarioRepository;
        _tokenService = tokenService;
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        User? usuario = await _usuarioRepository.ObterUsuarioPorEmailAsync(dto.EmailFatec);

        bool saoCredenciaisInvalidas = CredenciaisInvalidas(usuario, dto.Senha);

        if (saoCredenciaisInvalidas)
            throw new CredenciaisInvalidasException();

        string tokenGerado = _tokenService.GerarJwtToken(usuario!);

        return new TokenResponseDto
        {
            NomeCompleto = usuario!.FullName,
            Token = tokenGerado
        };
    }

    private static bool CredenciaisInvalidas(User? usuario, string senhaInserida)
    {
        if (usuario == null)
            return true;

        return !Verify(senhaInserida, usuario.Password);
    }
}
