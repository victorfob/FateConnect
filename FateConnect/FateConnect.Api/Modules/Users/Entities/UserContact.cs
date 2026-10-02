namespace FateConnect.Api.Modules.Users.Entities;

using FateConnect.Api.Modules.Users.Exceptions;

public sealed record UserContact(string Phone, string ContactEmail)
{
    public static UserContact? FromOptional(string? phone, string? contactEmail)
    {
        bool hasPhone = !string.IsNullOrWhiteSpace(phone);
        bool hasContactEmail = !string.IsNullOrWhiteSpace(contactEmail);

        if (!hasPhone && !hasContactEmail)
            return null;

        if (!hasPhone || !hasContactEmail)
            throw new IncompleteContactException();

        return new UserContact(phone!, contactEmail!);
    }
}
