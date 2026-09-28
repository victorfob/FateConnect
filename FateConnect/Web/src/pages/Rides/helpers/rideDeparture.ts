import { format, parseISO } from 'date-fns';

import { RideFrequencyEnum } from '@app/services/rides/types';
import { firstCharacters } from '@app/utils/sequence';

const DAY_AND_MONTH_FORMAT = 'dd/MM';
/** A API devolve `HH:mm:ss`; o cartão mostra só horas e minutos. */
const TIME_LENGTH = 5;
const NEXT_DEPARTURE_PREFIX = 'Próxima:';

/** A API manda a próxima saída, então só a carona com recorrência diz que ela é a próxima. */
export function rideDepartureLabel(
  departureDate: string,
  departureTime: string,
  frequency: RideFrequencyEnum,
): string {
  const departure = `${format(parseISO(departureDate), DAY_AND_MONTH_FORMAT)} às ${firstCharacters(departureTime, TIME_LENGTH)}`;
  if (frequency === RideFrequencyEnum.ONCE) return departure;

  return `${NEXT_DEPARTURE_PREFIX} ${departure}`;
}
