namespace FateConnect.Api.Modules.Common.Exceptions;

using System;

public class InvalidUserIdentifierException()
    : Exception("Não foi possível processar a requisição. O identificador de usuário fornecido é inválido ou não existe.");
