namespace FateConnect.Api.Modules.Auth.Attributes;

using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;

/// <summary>
/// Valida a autorização baseada no perfil do usuário, aplicando hierarquia.
/// Ex: Se exigir Operator, permite Operator e Administrator.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class AuthorizeProfileAttribute : AuthorizeAttribute
{
    public AuthorizeProfileAttribute(EnumProfileType minimumProfileRequired)
    {
        var allowedProfiles = Enum.GetValues<EnumProfileType>()
            .Where(p => (int)p >= (int)minimumProfileRequired)
            .Select(p => p.ToString());

        Roles = string.Join(",", allowedProfiles);
    }
}
