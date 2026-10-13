namespace FateConnect.Api.Modules.Emails.Templates;

using System;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Emails.Enums;

public static class AccountEmails
{
    public const string ButtonPointer = "botão";
    public const string LinkPointer = "link";

    private static readonly string LockoutTime = QuantityUtils.Minutes(AuthConstants.LockoutMinutes);
    private static readonly string FailedAttempts = QuantityUtils.Times(AuthConstants.MaxFailedLoginAttempts);

    public static readonly AccountEmail Confirmation = new(
        Subject: "Confirme seu e-mail do FateConnect",
        Route: "confirmar-email",
        ActionLabel: "Confirmar e-mail",
        ParagraphsPointingTo: pointer =>
        [
            "Você criou uma conta no FateConnect com este e-mail. Para começar a usar, confirme seu e-mail pelo " +
                $"{pointer} abaixo.",
            $"O link vale por {QuantityUtils.Hours(AuthConstants.EmailConfirmationHours)}.",
        ],
        IfItWasNotYou: "Se não foi você que criou a conta, pode ignorar este e-mail. " +
            "Ninguém consegue entrar sem a confirmação."
    );

    public static readonly AccountEmail PasswordReset = new(
        Subject: "Redefina sua senha do FateConnect",
        Route: "redefinir-senha",
        ActionLabel: "Redefinir senha",
        ParagraphsPointingTo: pointer =>
        [
            "Recebemos um pedido para redefinir a senha da sua conta no FateConnect.",
            $"Se foi você quem fez o pedido, use o {pointer} abaixo para escolher sua nova senha. Por segurança, " +
                $"este link expira em {QuantityUtils.Minutes(AuthConstants.PasswordResetMinutes)} e só pode ser " +
                "usado uma vez.",
        ],
        IfItWasNotYou: "Se não foi você, pode ignorar este e-mail. Sua senha continua a mesma."
    );

    public static readonly AccountEmail AccountLocked = new(
        Subject: $"Sua conta do FateConnect foi bloqueada por {LockoutTime}",
        Route: "desbloquear-conta",
        ActionLabel: "Desbloquear conta",
        ParagraphsPointingTo: pointer =>
        [
            $"Sua conta foi bloqueada porque a senha foi digitada errada {FailedAttempts} seguidas. Você pode " +
                $"desbloquear agora pelo {pointer} abaixo ou esperar {LockoutTime}, e depois é só entrar com a sua " +
                "senha.",
        ],
        IfItWasNotYou: $"Se não foi você, alguém tentou entrar com o seu e-mail e errou a senha {FailedAttempts}. " +
            "Para mais segurança, troque a senha em Meu perfil."
    );

    public static AccountEmail For(EnumAccountEmail email) => email switch
    {
        EnumAccountEmail.Confirmation => Confirmation,
        EnumAccountEmail.PasswordReset => PasswordReset,
        EnumAccountEmail.AccountLocked => AccountLocked,
        _ => throw new ArgumentOutOfRangeException(nameof(email), email, null),
    };
}
