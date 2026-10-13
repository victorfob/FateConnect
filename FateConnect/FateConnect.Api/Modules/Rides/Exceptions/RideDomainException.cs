namespace FateConnect.Api.Modules.Rides.Exceptions;

public abstract class RideDomainException(string message) : Exception(message);

public class InvalidDepartureScheduleException()
    : RideDomainException("A carona deve ser em data e hora futuras.");

public class InvalidDestinationException()
    : RideDomainException("O destino deve ter entre 3 e 100 caracteres.");

public class InvalidRideTypeException()
    : RideDomainException("Tipo de carona inválido.");

public class InvalidVehicleTypeException()
    : RideDomainException("Veículo inválido.");

public class RideNotDrivenByUserException()
    : Exception("Esta carona foi ofertada por outra pessoa. Só quem ofertou pode alterá-la.");

public class InvalidRideFrequencyException()
    : RideDomainException("Recorrência inválida.");

public class RepeatUntilOnASingleRideException()
    : RideDomainException("Só carona com recorrência tem data final.");

public class MissingRepeatUntilException()
    : RideDomainException("Informe a data final da recorrência.");

public class RepeatUntilBeforeDepartureException()
    : RideDomainException("A data final não pode ser anterior à partida.");

public class RepeatUntilTooFarException()
    : RideDomainException("A recorrência vai até no máximo 6 meses depois da partida.");

public class WeekdaysRideOnAWeekendException()
    : RideDomainException("A recorrência em dias úteis começa num dia útil.");

public class RideOnAHolidayException()
    : RideDomainException("Escolha um dia que não seja feriado.");
