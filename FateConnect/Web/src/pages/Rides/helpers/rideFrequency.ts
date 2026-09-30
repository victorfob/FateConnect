import { getDay, parseISO } from 'date-fns';

import { RideFrequencyEnum } from '@app/services/rides/types';

const RIDE_FREQUENCY_LABEL: Readonly<Record<RideFrequencyEnum, string>> = {
  [RideFrequencyEnum.ONCE]: 'Uma vez',
  [RideFrequencyEnum.WEEKDAYS]: 'Dias úteis',
  [RideFrequencyEnum.WEEKLY]: 'Semanal',
  [RideFrequencyEnum.MONTHLY]: 'Mensal',
};

/**
 * Pelo índice do `getDay`, que começa no domingo. No plural e sem artigo:
 * "Aos domingos" passa dos 80px que a fileira do cartão tem a 375px.
 */
const EVERY_WEEKDAY_LABEL: readonly string[] = [
  'Domingos',
  'Segundas',
  'Terças',
  'Quartas',
  'Quintas',
  'Sextas',
  'Sábados',
];

/** A mensal do dia 31 cai no dia 28 em fevereiro: o rótulo não promete o dia. */
const EVERY_MONTH_LABEL = 'Todo mês';

const RIDE_FREQUENCY_VALUES: ReadonlySet<string> = new Set(Object.values(RideFrequencyEnum));

/** Escolhas do campo, na ordem em que aparecem; a de uma vez só abre o campo. */
export const RIDE_FREQUENCY_OPTIONS: readonly { value: RideFrequencyEnum; label: string }[] = [
  RideFrequencyEnum.ONCE,
  RideFrequencyEnum.WEEKDAYS,
  RideFrequencyEnum.WEEKLY,
  RideFrequencyEnum.MONTHLY,
].map((frequency) => ({ value: frequency, label: RIDE_FREQUENCY_LABEL[frequency] }));

export function isRideFrequency(value: string): value is RideFrequencyEnum {
  return RIDE_FREQUENCY_VALUES.has(value);
}

/** O que o cartão diz da recorrência; a carona de uma vez só não diz nada. */
export function rideRecurrenceLabel(
  frequency: RideFrequencyEnum,
  nextDeparture: string,
): string | null {
  if (frequency === RideFrequencyEnum.WEEKDAYS) return RIDE_FREQUENCY_LABEL[frequency];
  if (frequency === RideFrequencyEnum.WEEKLY)
    return EVERY_WEEKDAY_LABEL[getDay(parseISO(nextDeparture))] ?? null;
  if (frequency === RideFrequencyEnum.MONTHLY) return EVERY_MONTH_LABEL;

  return null;
}
