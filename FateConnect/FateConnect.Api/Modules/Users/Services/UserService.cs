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
    private readonly IUserRepository _usuarioRepository;

    public UserService(IUserRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<UsuarioResponseDto> CadastrarAsync(CreateUsuarioDto dto)
    {
        await GarantirEmailUnicoAsync(dto.EmailFatec);

        User novoUsuario = MontarEntidadeUsuario(dto);

        await _usuarioRepository.AdicionarAsync(novoUsuario);

        UsuarioResponseDto resposta = new UsuarioResponseDto
        {
            Id = novoUsuario.Id,
            EmailFatec = novoUsuario.FatecEmail,
            NomeCompleto = novoUsuario.FullName
        };

        return resposta;
    }

    private async Task GarantirEmailUnicoAsync(string email)
    {
        bool emailEmUso = await _usuarioRepository.ExisteEmailAsync(email);

        if (emailEmUso)
            throw new EmailJaCadastradoException(email);
    }

    private static User MontarEntidadeUsuario(CreateUsuarioDto dto)
    {
        string senhaComHash = GerarHashDaSenha(dto.Senha);

        List<Address> enderecosMapeados = MontarListaDeEnderecos(dto.Enderecos);
        List<Contact> contatosMapeados = MontarListaDeContatos(dto.Contatos);

        User usuario = new User
        {
            FatecEmail = dto.EmailFatec,
            FullName = dto.NomeCompleto,
            Nickname = dto.Apelido,
            BirthDate = dto.DataNascimento,
            Gender = dto.Genero,
            Password = senhaComHash,
            ProfileType = EnumProfileType.Operator,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Addresses = enderecosMapeados,
            Contacts = contatosMapeados
        };

        return usuario;
    }

    private static List<Address> MontarListaDeEnderecos(List<CreateEnderecoDto>? dtos)
    {
        if (dtos is null or { Count: 0 })
            return new List<Address>();

        List<Address> enderecos = dtos.Select(dto => new Address
        {
            ZipCode = dto.Cep,
            Street = dto.Logradouro,
            StreetNumber = dto.Numero,
            Complement = dto.Complemento,
            City = dto.Cidade,
            State = dto.Estado
        }).ToList();

        return enderecos;
    }

    private static List<Contact> MontarListaDeContatos(List<CreateContatoDto>? dtos)
    {
        if (dtos is null or { Count: 0 })
            return new List<Contact>();

        List<Contact> contatos = dtos.Select(dto => new Contact
        {
            Phone = dto.Telefone,
            ContactEmail = dto.EmailContato
        }).ToList();

        return contatos;
    }

    private static string GerarHashDaSenha(string senhaPadrao)
    {
        return HashPassword(senhaPadrao);
    }
}
