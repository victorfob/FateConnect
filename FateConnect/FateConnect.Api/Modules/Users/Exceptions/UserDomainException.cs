namespace FateConnect.Api.Modules.Users.Exceptions;

using System;
using FateConnect.Api.Modules.Users.Enums;

public abstract class UserDomainException(string message) : Exception(message);

public abstract class AlreadyRegisteredException(string field, string message) : InvalidOperationException(message)
{
    public string Field { get; } = field;
}

public class InvalidUserFullNameException()
    : UserDomainException("The full name must have between 3 and 200 characters.");

public class InvalidFatecEmailLocalPartException()
    : UserDomainException("The e-mail address has invalid characters before the '@'.");

public class InvalidFatecEmailDomainException()
    : UserDomainException("The e-mail does not belong to a valid Fatec domain.");

public class InvalidGenderException()
    : UserDomainException("Invalid gender.");

public class InvalidNeighborhoodException()
    : UserDomainException("The neighborhood and city must have at most 100 characters.");

public class ContactEmailAlreadyRegisteredException(string contactEmail)
    : AlreadyRegisteredException("contactEmail", $"The contact e-mail '{contactEmail}' is already in use.");

public class ContactPhoneAlreadyRegisteredException(string phone)
    : AlreadyRegisteredException("phone", $"The phone '{phone}' is already in use.");

public class EmailAlreadyRegisteredException(string email)
    : AlreadyRegisteredException("fatecEmail", $"The e-mail '{email}' is already in use.");

public class CannotModifyOwnAccountException()
    : UserDomainException("An administrator cannot ban, demote or change the status of their own account.");

public class InvalidDocumentVersionException()
    : UserDomainException("The version of the accepted document is required and cannot be blank.");

public class IncorrectCurrentPasswordException()
    : UserDomainException("The current password is incorrect.");

public class IncompleteContactException()
    : UserDomainException("To save the contact, fill in both the phone and the e-mail.");

public class ContactRequiredException(EnumPublication publication)
    : InvalidOperationException(MessageFor(publication))
{
    public const string ErrorCode = "ContactRequired";

    private static string MessageFor(EnumPublication publication) => publication switch
    {
        EnumPublication.Ride => "To offer a ride, add a contact phone and e-mail in My profile.",
        EnumPublication.LostAndFoundItem => "To register an item, add a contact phone and e-mail in My profile.",
        EnumPublication.IdentifiedReport => "To send an identified report, add a contact phone and e-mail in " +
            "My profile, or mark the report as anonymous.",
        _ => throw new ArgumentOutOfRangeException(nameof(publication), publication, null)
    };
}

public class InvalidUserStatusTransitionException()
    : UserDomainException("This account status change is not possible through this endpoint.");

public class InvalidTokenException()
    : UserDomainException("The token is invalid or blank.");

public class MissingLegalDocumentVersionException(EnumDocumentType document)
    : InvalidOperationException($"The legal document versions file has no current version for {document}.");

public class MissingLegalDocumentVersionsFileException(string resourceName)
    : InvalidOperationException($"The legal document versions file '{resourceName}' is not embedded in the API.");
