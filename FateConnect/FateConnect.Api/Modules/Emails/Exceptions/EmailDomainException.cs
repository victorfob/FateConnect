namespace FateConnect.Api.Modules.Emails.Exceptions;

using System;

public abstract class EmailDomainException(string message) : Exception(message);

public class MissingEmailConfigurationException(string variableName)
    : EmailDomainException($"A variável de ambiente {variableName} não foi configurada.");
