import { addMonths, isValid, isWeekend, parse, startOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';

import { isRideFrequency } from '@app/pages/Rides/helpers/rideFrequency';
import { isRideType } from '@app/pages/Rides/helpers/rideType';
import { isVehicleType } from '@app/pages/Rides/helpers/rideVehicle';
import { RideFrequencyEnum } from '@app/services/rides/types';
import { toApiDate } from '@app/utils/apiDate';

import { PRODUCT_TIME_ZONE, RIDE_FORM_MESSAGES, RIDE_LIMITS } from '../constants';

const REQUIRED = 1;
/** O campo entrega o que a pessoa digitou, não o formato da API. */
const DEPARTURE_FORMAT = 'dd/MM/yyyy HH:mm';
const REPEAT_UNTIL_FORMAT = 'dd/MM/yyyy';

function parseDeparture(departure: string): Date {
  return parse(departure, DEPARTURE_FORMAT, new Date());
}

function parseRepeatUntil(repeatUntil: string): Date {
  return parse(repeatUntil, REPEAT_UNTIL_FORMAT, new Date());
}

/** Campo vazio passa: quem reclama dele é a regra de obrigatoriedade. */
function isReadableDeparture(departure: string): boolean {
  if (!departure) return true;

  return isValid(parseDeparture(departure));
}

/** Partida ilegível passa: quem reclama dela é a regra de formato. */
function isFutureDeparture(departure: string): boolean {
  const parsed = parseDeparture(departure);
  if (!isValid(parsed)) return true;

  return fromZonedTime(parsed, PRODUCT_TIME_ZONE).getTime() > Date.now();
}

type ScheduleRuleInput = {
  departure: Date;
  frequency: RideFrequencyEnum;
  repeatUntil: string;
};

/**
 * As regras que a API cobra da partida e da recorrência. Devolve o campo e a
 * mensagem da primeira que falha, na ordem em que a API as confere.
 */
function scheduleIssue(
  { departure, frequency, repeatUntil }: ScheduleRuleInput,
  holidays: ReadonlySet<string>,
): { path: 'departure' | 'repeatUntil'; message: string } | null {
  if (!isValid(departure)) return null;
  if (holidays.has(toApiDate(departure)))
    return { path: 'departure', message: RIDE_FORM_MESSAGES.departureOnHoliday };
  if (frequency === RideFrequencyEnum.ONCE) return null;
  if (!repeatUntil) return { path: 'repeatUntil', message: RIDE_FORM_MESSAGES.repeatUntilRequired };

  const lastDeparture = parseRepeatUntil(repeatUntil);
  if (!isValid(lastDeparture))
    return { path: 'repeatUntil', message: RIDE_FORM_MESSAGES.repeatUntilInvalid };

  const firstDay = startOfDay(departure);
  if (lastDeparture < firstDay)
    return { path: 'repeatUntil', message: RIDE_FORM_MESSAGES.repeatUntilBeforeDeparture };
  if (lastDeparture > addMonths(firstDay, RIDE_LIMITS.maxRecurrenceMonths))
    return { path: 'repeatUntil', message: RIDE_FORM_MESSAGES.repeatUntilTooFar };

  if (frequency === RideFrequencyEnum.WEEKDAYS && isWeekend(departure))
    return { path: 'departure', message: RIDE_FORM_MESSAGES.departureOnWeekend };

  return null;
}

/** Feriado só se conhece pela API; sem a lista, a checagem dele fica com ela. */
export function createRideFormSchema(holidays: ReadonlySet<string>) {
  return z
    .object({
      destination: z
        .string()
        .trim()
        .min(RIDE_LIMITS.minDestination, RIDE_FORM_MESSAGES.destinationTooShort)
        .max(RIDE_LIMITS.maxDestination, RIDE_FORM_MESSAGES.destinationTooLong),
      // A transformação estreita a saída: o campo guarda texto e o schema entrega a
      // partida já lida, então o envio a separa sem reinterpretar a máscara.
      departure: z
        .string()
        .min(REQUIRED, RIDE_FORM_MESSAGES.departureRequired)
        .refine(isReadableDeparture, RIDE_FORM_MESSAGES.departureInvalid)
        .refine(isFutureDeparture, RIDE_FORM_MESSAGES.departureInPast)
        .transform(parseDeparture),
      // O predicado estreita a saída: o formulário guarda texto, o schema entrega
      // `RideTypeEnum`, e o mapeamento para a requisição não precisa de conversão.
      rideType: z.string().refine(isRideType, RIDE_FORM_MESSAGES.rideTypeRequired),
      vehicleType: z.string().refine(isVehicleType, RIDE_FORM_MESSAGES.vehicleTypeRequired),
      frequency: z.string().refine(isRideFrequency, RIDE_FORM_MESSAGES.frequencyRequired),
      repeatUntil: z.string(),
      description: z
        .string()
        .trim()
        .max(RIDE_LIMITS.maxDescription, RIDE_FORM_MESSAGES.descriptionTooLong),
    })
    .superRefine((values, context) => {
      const issue = scheduleIssue(values, holidays);
      if (issue) context.addIssue({ code: 'custom', path: [issue.path], message: issue.message });
    })
    .transform(({ repeatUntil, ...values }) => ({
      ...values,
      repeatUntil: toRepeatUntilDate(values.frequency, repeatUntil),
    }));
}

/** Na carona de uma vez só a data final não existe, mesmo que o campo guarde algo. */
function toRepeatUntilDate(frequency: RideFrequencyEnum, repeatUntil: string): Date | null {
  if (frequency === RideFrequencyEnum.ONCE) return null;

  return parseRepeatUntil(repeatUntil);
}

type RideFormSchema = ReturnType<typeof createRideFormSchema>;

/** O que os campos guardam: tudo texto, inclusive a partida. */
export type RideFormInput = z.input<RideFormSchema>;
/** O que sai validado, com a partida e a data final lidas e os enums estreitados. */
export type RideFormValues = z.output<RideFormSchema>;

export const EMPTY_RIDE_FORM: RideFormInput = {
  destination: '',
  departure: '',
  rideType: '',
  vehicleType: '',
  frequency: RideFrequencyEnum.ONCE,
  repeatUntil: '',
  description: '',
};
