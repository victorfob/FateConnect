using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Exceptions;
using static BCrypt.Net.BCrypt;

namespace FateConnect.Api.Modules.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        User? user = await _userRepository.GetByEmailAsync(dto.FatecEmail);

        bool areCredentialsInvalid = AreCredentialsInvalid(user, dto.Password);

        if (areCredentialsInvalid)
            throw new InvalidCredentialsException();

        string generatedToken = _tokenService.GenerateJwtToken(user!);

        return new TokenResponseDto { Token = generatedToken };
    }

    private static bool AreCredentialsInvalid(User? user, string providedPassword)
    {
        if (user == null)
            return true;

        return !Verify(providedPassword, user.Password);
    }
}
