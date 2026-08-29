namespace FateConnect.Api.Modules.Auth.Exceptions;

public class UnidentifiedUserException()
    : Exception("The token does not identify a user.");
