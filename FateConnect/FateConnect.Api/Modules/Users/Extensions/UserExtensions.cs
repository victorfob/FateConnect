namespace FateConnect.Api.Modules.Users.Extensions;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Entities;

public static class UserExtensions
{
    public static UserContactDto ToContactDto(this User user) =>
        new(user.FullName, user.ContactEmail, user.Phone);
}
