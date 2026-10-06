namespace FateConnect.Api.Modules.Auth.Exceptions;

using System;

public abstract class AuthDomainException(string message) : Exception(message);

public class BannedAccountException()
    : AuthDomainException("Esta conta foi banida da plataforma.");

public class DeactivatedAccountException()
    : AuthDomainException("Esta conta está desativada. Reative-a para entrar.");

public class InvalidCredentialsException()
    : AuthDomainException("E-mail ou senha inválidos.");

public class EmailNotConfirmedException()
    : AuthDomainException("Para acessar o sistema, é necessário confirmar o seu e-mail através do link que enviamos.");

public class UnconfiguredProfileHierarchyException(string profileType)
    : Exception($"A hierarquia de acesso para o perfil '{profileType}' não foi configurada no AuthorizeProfileAttribute. Atualize o mapa de perfis permitidos.");

public class UnidentifiedTokenException()
    : UnauthorizedAccessException("Sessão encerrada. Entre novamente para continuar.");

public class UnidentifiedUserException()
    : UnauthorizedAccessException("Sessão expirada. Entre novamente para continuar.");

public class InvalidConfirmationTokenException()
    : AuthDomainException("O link de confirmação é inválido ou não foi encontrado.");

public class EmailAlreadyConfirmedException()
    : AuthDomainException("Este e-mail já foi confirmado anteriormente.");

public class ExpiredConfirmationTokenException()
    : AuthDomainException("O link de confirmação expirou. Por favor, solicite um novo.");
