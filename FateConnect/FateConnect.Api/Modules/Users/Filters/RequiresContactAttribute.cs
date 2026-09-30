namespace FateConnect.Api.Modules.Users.Filters;

using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Mvc;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public sealed class RequiresContactAttribute : TypeFilterAttribute
{
    public RequiresContactAttribute(EnumPublication publication) : base(typeof(RequiresContactFilter))
    {
        Arguments = [publication];
    }
}
