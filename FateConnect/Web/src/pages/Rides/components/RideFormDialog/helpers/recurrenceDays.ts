import { addMonths, isValid, isWeekend, parse, startOfDay } from 'date-fns';

import { RideFrequencyEnum } from '@app/services/rides/types';
import { toApiDate } from '@app/utils/apiDate';

import { RIDE_LIMITS } from '../constants';

const DEPARTURE_FORMAT = 'dd/MM/yyyy HH:mm';

export type RepeatUntilRange = { minDate?: Date; maxDate?: Date };

/** Dia que a carona não aceita como partida: feriado em qualquer uma, e fim de semana na de dias úteis. */
export function isRuledOutDeparture(
  day: Date,
  frequency: string,
  holidays: ReadonlySet<string>,
): boolean {
  if (holidays.has(toApiDate(day))) return true;

  return frequency === RideFrequencyEnum.WEEKDAYS && isWeekend(day);
}

/** A faixa da data final: da partida até o teto; partida ilegível não limita nada. */
export function repeatUntilRange(departure: string): RepeatUntilRange {
  const parsed = parse(departure, DEPARTURE_FORMAT, new Date());
  if (!isValid(parsed)) return {};

  const firstDay = startOfDay(parsed);

  return { minDate: firstDay, maxDate: addMonths(firstDay, RIDE_LIMITS.maxRecurrenceMonths) };
}
