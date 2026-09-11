namespace FateConnect.Api.Modules.Common.Exceptions;

using System;

public class InvalidUserIdentifierException()
    : Exception("Não foi possível identificar o usuário. O identificador fornecido é inválido.");
