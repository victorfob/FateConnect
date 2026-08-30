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

    public UserService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<TokenResponseDto> SignUpAsync(CreateUserDto dto)
    {
        await EnsureEmailIsUniqueAsync(dto.FatecEmail);

        User newUser = BuildUser(dto);

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

    private static User BuildUser(CreateUserDto dto)
    {
        string hashedPassword = HashPassword(dto.Password);

        List<Address> mappedAddresses = BuildAddresses(dto.Addresses);
        List<Contact> mappedContacts = BuildContacts(dto.Contacts);

        User user = new User
        {
            FatecEmail = dto.FatecEmail,
            FullName = dto.FullName,
            Nickname = dto.Nickname,
            BirthDate = dto.BirthDate,
            Gender = dto.Gender,
            Password = hashedPassword,
            ProfileType = EnumProfileType.Operator,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Addresses = mappedAddresses,
            Contacts = mappedContacts
        };

        return user;
    }

    private static List<Address> BuildAddresses(List<CreateAddressDto>? dtos)
    {
        if (dtos is null or { Count: 0 })
            return [];

        List<Address> addresses = dtos.Select(dto => new Address
        {
            ZipCode = dto.ZipCode,
            Street = dto.Street,
            StreetNumber = dto.StreetNumber,
            Complement = dto.Complement,
            City = dto.City,
            State = dto.State
        }).ToList();

        return addresses;
    }

    private static List<Contact> BuildContacts(List<CreateContactDto>? dtos)
    {
        if (dtos is null or { Count: 0 })
            return [];

        List<Contact> contacts = dtos.Select(dto => new Contact
        {
            Phone = dto.Phone,
            ContactEmail = dto.ContactEmail
        }).ToList();

        return contacts;
    }
}
