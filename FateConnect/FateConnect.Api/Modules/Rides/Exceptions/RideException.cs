namespace FateConnect.Api.Modules.Rides.Exceptions;

public abstract class RideDomainException(string message) : Exception(message);

public class InvalidDepartureScheduleException()
    : RideDomainException("A carona deve ser em data e hora futuras.");

public class InvalidAvailableSeatsException(int seats)
    : RideDomainException($"A carona deve ter entre 1 e 7 vagas. Recebido: {seats}.");

public class InvalidDestinationException()
    : RideDomainException("O destino deve ter entre 3 e 100 caracteres.");

public class InvalidRideTypeException()
    : RideDomainException("Tipo de carona inválido.");

public class InvalidRideDriverException()
    : RideDomainException("Não foi possível identificar quem está ofertando a carona. Entre novamente.");

public class RideNotDrivenByUserException()
    : Exception("Esta carona foi ofertada por outra pessoa. Só quem ofertou pode alterá-la.");
