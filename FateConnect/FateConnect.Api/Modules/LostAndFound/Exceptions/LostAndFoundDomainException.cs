namespace FateConnect.Api.Modules.LostAndFound.Exceptions;

using FateConnect.Api.Modules.Common.Exceptions;

public abstract class LostAndFoundDomainException(string message) : Exception(message);

public class InvalidOccurrenceDateException()
    : LostAndFoundDomainException("The date it happened cannot be in the future.");

public class MissingOccurrenceDateException()
    : LostAndFoundDomainException("The date it happened is required.");

public class InvalidLostAndFoundNameException()
    : LostAndFoundDomainException("The item name must have between 3 and 100 characters.");

public class InvalidLostAndFoundPlaceException()
    : LostAndFoundDomainException("The place must have between 3 and 100 characters.");

public class InvalidLostAndFoundTypeException()
    : LostAndFoundDomainException("Invalid lost and found type.");

public class InvalidLostAndFoundStatusException()
    : LostAndFoundDomainException("Invalid item status.");

public class LostAndFoundNotReportedByUserException()
    : NotOwnedByUserException("This item was registered by someone else. Only who registered it can change it.");
