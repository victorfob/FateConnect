namespace FateConnect.Api.Modules.Communications.Exceptions;

using System;

public abstract class CommunicationDomainException(string message) : Exception(message);

public class MissingCommunicationConfigurationException(string variableName)
    : CommunicationDomainException($"A variável de ambiente {variableName} não foi configurada.");
