namespace FateConnect.Api.Modules.Users.Exceptions;

using System;

public abstract class UserDomainException(string message) : Exception(message);

public abstract class AlreadyRegisteredException(string field, string message) : InvalidOperationException(message)
{
    public string Field { get; } = field;
}

public class InvalidUserFullNameException()
    : UserDomainException("O nome completo deve ter entre 3 e 200 caracteres.");

public class InvalidFatecEmailDomainException()
    : UserDomainException("O e-mail fornecido não pertence a um domínio válido da Fatec.");

public class UnderageUserException()
    : UserDomainException("É necessário ter pelo menos 18 anos.");

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
