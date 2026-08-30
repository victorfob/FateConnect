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

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UsuarioResponseDto> SignUpAsync(CreateUsuarioDto dto)
    {
        await EnsureEmailIsUniqueAsync(dto.EmailFatec);

        User newUser = BuildUser(dto);

        await _userRepository.AddAsync(newUser);

        UsuarioResponseDto response = new UsuarioResponseDto
        {
            Id = newUser.Id,
            EmailFatec = newUser.FatecEmail,
            NomeCompleto = newUser.FullName
        };

        return response;
    }

    private async Task EnsureEmailIsUniqueAsync(string email)
    {
        bool emailInUse = await _userRepository.EmailExistsAsync(email);

        if (emailInUse)
            throw new EmailJaCadastradoException(email);
    }

    private static User BuildUser(CreateUsuarioDto dto)
    {
        string hashedPassword = HashPassword(dto.Senha);

        List<Address> mappedAddresses = BuildAddresses(dto.Enderecos);
        List<Contact> mappedContacts = BuildContacts(dto.Contatos);

        User user = new User
        {
            FatecEmail = dto.EmailFatec,
            FullName = dto.NomeCompleto,
            Nickname = dto.Apelido,
            BirthDate = dto.DataNascimento,
            Gender = dto.Genero,
            Password = hashedPassword,
            ProfileType = EnumProfileType.Operator,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Addresses = mappedAddresses,
            Contacts = mappedContacts
        };

        return user;
    }

    private static List<Address> BuildAddresses(List<CreateEnderecoDto>? dtos)
    {
        if (dtos is null or { Count: 0 })
            return [];

        List<Address> addresses = dtos.Select(dto => new Address
        {
            ZipCode = dto.Cep,
            Street = dto.Logradouro,
            StreetNumber = dto.Numero,
            Complement = dto.Complemento,
            City = dto.Cidade,
            State = dto.Estado
        }).ToList();

        return addresses;
    }

    private static List<Contact> BuildContacts(List<CreateContatoDto>? dtos)
    {
        if (dtos is null or { Count: 0 })
            return [];

        List<Contact> contacts = dtos.Select(dto => new Contact
        {
            Phone = dto.Telefone,
            ContactEmail = dto.EmailContato
        }).ToList();

        return contacts;
    }
}
