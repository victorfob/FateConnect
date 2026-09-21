namespace FateConnect.Api.Modules.Auth.Attributes;

using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public class AuthorizeProfileAttribute : AuthorizeAttribute
{
    public AuthorizeProfileAttribute(EnumProfileType minimumProfileRequired)
    {
        var allowedProfiles = GetAllowedProfiles(minimumProfileRequired);
        Roles = string.Join(",", allowedProfiles);
    }

    private static IEnumerable<string> GetAllowedProfiles(EnumProfileType minimumProfileRequired)
    {
        return minimumProfileRequired switch
        {
            EnumProfileType.Administrator => [EnumProfileType.Administrator.ToString()],

            EnumProfileType.Operator => [EnumProfileType.Operator.ToString(), EnumProfileType.Administrator.ToString()],

            _ => throw new UnconfiguredProfileHierarchyException(minimumProfileRequired.ToString())
        };
    }
}
