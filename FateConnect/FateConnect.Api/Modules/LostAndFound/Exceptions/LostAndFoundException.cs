namespace FateConnect.Api.Modules.LostAndFound.Exceptions;

public abstract class LostAndFoundDomainException(string message) : Exception(message);

public class InvalidOccurrenceDateException()
    : LostAndFoundDomainException("A data do ocorrido não pode ser no futuro.");

public class MissingOccurrenceDateException()
    : LostAndFoundDomainException("Informe a data do ocorrido.");

public class InvalidLostAndFoundNameException()
    : LostAndFoundDomainException("O nome do item deve ter entre 3 e 100 caracteres.");

public class InvalidLostAndFoundPlaceException()
    : LostAndFoundDomainException("O local deve ter entre 3 e 100 caracteres.");

public class InvalidLostAndFoundTypeException()
    : LostAndFoundDomainException("Tipo de registro de achados e perdidos inválido.");

public class InvalidLostAndFoundStatusException()
    : LostAndFoundDomainException("Status do registro inválido.");

public class LostAndFoundNotReportedByUserException()
    : Exception("Este registro foi criado por outra pessoa. Só quem o reportou pode alterá-lo.");
