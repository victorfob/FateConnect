using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
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
        User user = await AuthenticateAsync(dto);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
            throw new DeactivatedAccountException();

        return IssueToken(user);
    }

    public async Task<TokenResponseDto> ReactivateAsync(LoginDto dto)
    {
        User user = await AuthenticateAsync(dto);

        if (user.Status is EnumAccountStatus.SelfDeactivated)
            await _userRepository.ReactivateAsync(user.Id);

        return IssueToken(user);
    }

    public async Task LogoutAsync(int userId)
    {
        await _userRepository.IncrementTokenVersionAsync(userId);
    }

    private async Task<User> AuthenticateAsync(LoginDto dto)
    {
        User? user = await _userRepository.GetByEmailAsync(dto.FatecEmail);

        if (user is null)
            throw new InvalidCredentialsException();

        if (user.Status is EnumAccountStatus.Banned)
            throw new BannedAccountException();

        bool isPasswordWrong = !Verify(dto.Password, user.Password);

        if (isPasswordWrong)
            throw new InvalidCredentialsException();

        return user;
    }

    private TokenResponseDto IssueToken(User user) =>
        new() { Token = _tokenService.GenerateJwtToken(user) };
}
