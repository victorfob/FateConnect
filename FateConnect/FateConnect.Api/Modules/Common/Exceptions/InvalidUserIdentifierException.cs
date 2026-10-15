namespace FateConnect.Api.Modules.Common.Exceptions;

using System;

public class InvalidUserIdentifierException()
    : Exception(
        "The request could not be processed. The user identifier is invalid or does not exist.");
