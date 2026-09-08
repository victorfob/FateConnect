namespace FateConnect.Api.Modules.Users.Extensions;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Entities;

public static class UserExtensions
{
    public static UserContactDto ToContactDto(this User user)
    {
        var contact = user.Contacts.First();

        return new UserContactDto(
            user.FullName,
            contact.ContactEmail,
            contact.Phone
        );
    }
}
