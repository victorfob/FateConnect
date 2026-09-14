namespace FateConnect.Api.Modules.Auth.Exceptions;

using System;

public class UnconfiguredProfileHierarchyException : Exception
{
    public UnconfiguredProfileHierarchyException(string profileType)
        : base($"A hierarquia de acesso para o perfil '{profileType}' não foi configurada no AuthorizeProfileAttribute. Atualize o mapa de perfis permitidos.")
    {
    }
}
