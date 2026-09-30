namespace FateConnect.Api.Modules.Users.Filters;

using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

public sealed class RequiresContactFilter(IUserRepository userRepository, EnumPublication publication) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = await userRepository.GetByIdAsync(context.HttpContext.User.GetUserId(), asNoTracking: true);

        if (user is not { HasContact: true })
            throw new ContactRequiredException(publication);

        await next();
    }
}
