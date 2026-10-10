namespace FateConnect.Api.Modules.Users.Exceptions;

using FateConnect.Api.Modules.Users.Enums;
using System;

public abstract class UserDomainException(string message) : Exception(message);

public abstract class AlreadyRegisteredException(string field, string message) : InvalidOperationException(message)
{
    public string Field { get; } = field;
}

public class InvalidUserFullNameException()
    : UserDomainException("O nome completo deve ter entre 3 e 200 caracteres.");

public class InvalidFatecEmailLocalPartException()
    : UserDomainException("O endereço de e-mail contém caracteres inválidos antes do '@'.");

public class InvalidFatecEmailDomainException()
    : UserDomainException("O e-mail fornecido não pertence a um domínio válido da Fatec.");

public class InvalidGenderException()
    : UserDomainException("O gênero informado é inválido.");

public class InvalidNeighborhoodException()
    : UserDomainException("O bairro pode ter no máximo 100 caracteres.");

public class ContactEmailAlreadyRegisteredException(string contactEmail)
    : AlreadyRegisteredException("contactEmail", $"O e-mail de contato '{contactEmail}' já está em uso no sistema.");

public class ContactPhoneAlreadyRegisteredException(string phone)
    : AlreadyRegisteredException("phone", $"O telefone '{phone}' já está em uso no sistema.");

public class EmailAlreadyRegisteredException(string email)
    : AlreadyRegisteredException("fatecEmail", $"O e-mail '{email}' já está em uso no sistema.");

public class CannotModifyOwnAccountException()
    : UserDomainException("Não é permitido banir, rebaixar ou alterar o status da própria conta administrativa.");

public class InvalidDocumentVersionException()
    : UserDomainException("A versão do documento aceito é obrigatória e não pode estar em branco.");

public class IncorrectCurrentPasswordException()
    : UserDomainException("A senha atual informada está incorreta.");

public class IncompleteContactException()
    : UserDomainException("Para salvar as informações de contato, preencha o telefone e o e-mail.");

public class ContactRequiredException(EnumPublication publication)
    : InvalidOperationException(MessageFor(publication))
{
    public const string ErrorCode = "ContactRequired";

    private static string MessageFor(EnumPublication publication) => publication switch
    {
        EnumPublication.Ride => "Para ofertar carona, cadastre telefone e e-mail para contato em Meu perfil.",
        EnumPublication.LostAndFoundItem => "Para cadastrar um item, cadastre telefone e e-mail para contato em Meu perfil.",
        EnumPublication.IdentifiedDenunciation => "Para enviar uma denúncia sem sigilo, cadastre telefone e e-mail para contato em Meu perfil, ou marque a denúncia como sigilosa.",
        _ => throw new ArgumentOutOfRangeException(nameof(publication), publication, null)
    };
}

public class InvalidUserStatusTransitionException()
    : UserDomainException("Não é possível realizar esta alteração de status de conta por este endpoint.");

public class InvalidTokenException()
    : UserDomainException("O token fornecido é inválido ou está em branco.");
