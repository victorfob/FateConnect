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

public class InvalidPasswordResetTokenException()
    : AuthDomainException("O link de redefinição de senha é inválido ou não foi encontrado.");

public class PasswordResetTokenConsumedException()
    : AuthDomainException("Este link já foi utilizado para redefinir a senha.");

public class ExpiredPasswordResetTokenException()
    : AuthDomainException("O link de redefinição expirou. Por favor, solicite um novo.");

public class AccountLockedException : AuthDomainException
{
    public int MinutesRemaining { get; }
    public const string ErrorCode = "AccountLocked";

    public AccountLockedException(int minutesRemaining)
        : base(BuildMessage(minutesRemaining))
    {
        MinutesRemaining = minutesRemaining;
    }

    private static string BuildMessage(int minutes)
    {
        string tempo = minutes == 1 ? "1 minuto" : $"{minutes} minutos";

        return $"Conta bloqueada por excesso de tentativas. Aguarde {tempo} para tentar de novo ou acesse seu e-mail institucional para desbloqueá-la imediatamente.";
    }
}

public class InvalidUnlockTokenException()
    : AuthDomainException("O link de desbloqueio é inválido ou não foi encontrado.");

public class ExpiredUnlockTokenException()
    : AuthDomainException("Este link expirou. O tempo de segurança já passou e você já pode fazer login normalmente com a sua senha.");

public class UserNotFoundException()
    : AuthDomainException("Não há conta cadastrada com este e-mail.");
