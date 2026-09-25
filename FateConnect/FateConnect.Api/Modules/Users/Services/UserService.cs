using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Modules.Users.Interfaces;
using static BCrypt.Net.BCrypt;

namespace FateConnect.Api.Modules.Users.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly TimeProvider _timeProvider;

    public UserService(IUserRepository userRepository, ITokenService tokenService, TimeProvider timeProvider)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _timeProvider = timeProvider;
    }

    public async Task<TokenResponseDto> SignUpAsync(CreateUserDto dto, RequestOrigin origin)
    {
        await EnsureEmailIsUniqueAsync(dto.FatecEmail);
        await EnsureContactIsUniqueAsync(dto.Phone, dto.ContactEmail);

        User newUser = BuildUser(dto, origin, _timeProvider.GetUtcNow().UtcDateTime);

        await _userRepository.AddAsync(newUser);

        string generatedToken = _tokenService.GenerateJwtToken(newUser);

        return new TokenResponseDto { Token = generatedToken };
    }

    private async Task EnsureEmailIsUniqueAsync(string email)
    {
        bool emailInUse = await _userRepository.EmailExistsAsync(email);

        if (emailInUse)
            throw new EmailAlreadyRegisteredException(email);
    }

    private async Task EnsureContactIsUniqueAsync(string phone, string contactEmail)
    {
        bool phoneIsTaken = await _userRepository.ContactPhoneExistsAsync(phone);

        if (phoneIsTaken)
            throw new ContactPhoneAlreadyRegisteredException(phone);

        bool contactEmailIsTaken = await _userRepository.ContactEmailExistsAsync(contactEmail);

        if (contactEmailIsTaken)
            throw new ContactEmailAlreadyRegisteredException(contactEmail);
    }

    private static User BuildUser(CreateUserDto dto, RequestOrigin origin, DateTime now)
    {
        string hashedPassword = HashPassword(dto.Password);

        User user = new User
        {
            FatecEmail = dto.FatecEmail,
            FullName = dto.FullName,
            BirthDate = dto.BirthDate,
            Gender = dto.Gender,
            Password = hashedPassword,
            ProfileType = EnumProfileType.Operator,
            CreatedAt = now,
            UpdatedAt = null,
            Phone = dto.Phone,
            ContactEmail = dto.ContactEmail,
            Status = EnumAccountStatus.Active,
            Preferences = new UserPreferences
            {
                ReceiveEmails = dto.ReceiveEmails ?? false,
                ReceiveNotifications = dto.ReceiveNotifications ?? false
            },
            DocumentAcceptances = BuildAcceptances(dto.Acceptances, origin, now)
        };

        return user;
    }

    private static List<DocumentAcceptance> BuildAcceptances(
        List<DocumentAcceptanceDto> dtos,
        RequestOrigin origin,
        DateTime acceptedAt) =>
        [.. dtos.Select(dto => new DocumentAcceptance
        {
            DocumentType = dto.Document,
            Version = dto.Version,
            AcceptedAt = acceptedAt,
            IpAddress = origin.IpAddress,
            UserAgent = origin.UserAgent
        })];
}
