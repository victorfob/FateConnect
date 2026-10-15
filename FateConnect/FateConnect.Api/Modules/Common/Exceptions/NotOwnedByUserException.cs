namespace FateConnect.Api.Modules.Common.Exceptions;

using System;

public abstract class NotOwnedByUserException(string message) : Exception(message);
