namespace FateConnect.Api.Modules.Auth.Exceptions;

public class UnidentifiedUserException()
    : Exception("Sessão expirada. Entre novamente para continuar.");
