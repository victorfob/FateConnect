import { isValid, parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';

import { isRideType } from '@app/pages/Rides/helpers/rideType';

import { PRODUCT_TIME_ZONE, RIDE_FORM_MESSAGES, RIDE_LIMITS } from '../constants';

const REQUIRED = 1;
/** Os campos entregam o que a pessoa digitou, não o formato da API. */
const DEPARTURE_FORMAT = 'dd/MM/yyyy HH:mm';

type DepartureFields = { departureDate: string; departureTime: string };

function isSeatCount(value: string): boolean {
  const seats = Number(value);

  return Number.isInteger(seats) && seats >= RIDE_LIMITS.minSeats && seats <= RIDE_LIMITS.maxSeats;
}

/**
 * A regra é do par data + hora, então mora no objeto. Campo ainda vazio ou
 * ilegível passa: quem reclama disso é a regra de cada campo, e acumular as
 * duas mensagens no mesmo lugar só confunde quem está preenchendo.
 */
function isFutureDeparture({ departureDate, departureTime }: DepartureFields): boolean {
  if (!departureDate || !departureTime) return true;

  const departure = parse(`${departureDate} ${departureTime}`, DEPARTURE_FORMAT, new Date());
  if (!isValid(departure)) return true;

  return fromZonedTime(departure, PRODUCT_TIME_ZONE).getTime() > Date.now();
}

export const rideFormSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(RIDE_LIMITS.minDestination, RIDE_FORM_MESSAGES.destinationTooShort)
      .max(RIDE_LIMITS.maxDestination, RIDE_FORM_MESSAGES.destinationTooLong),
    departureDate: z.string().min(REQUIRED, RIDE_FORM_MESSAGES.departureDateRequired),
    departureTime: z.string().min(REQUIRED, RIDE_FORM_MESSAGES.departureTimeRequired),
    // O predicado estreita a saída: o formulário guarda texto, o schema entrega
    // `RideTypeEnum`, e o mapeamento para a requisição não precisa de conversão.
    rideType: z.string().refine(isRideType, RIDE_FORM_MESSAGES.rideTypeRequired),
    seats: z.string().refine(isSeatCount, RIDE_FORM_MESSAGES.seatsRequired),
    description: z
      .string()
      .trim()
      .max(RIDE_LIMITS.maxDescription, RIDE_FORM_MESSAGES.descriptionTooLong),
  })
  .refine(isFutureDeparture, {
    error: RIDE_FORM_MESSAGES.departureInPast,
    path: ['departureDate'],
  });

/** O que os campos guardam: tudo texto, inclusive a data. */
export type RideFormInput = z.input<typeof rideFormSchema>;
/** O que sai validado, já com o tipo de carona estreitado. */
export type RideFormValues = z.output<typeof rideFormSchema>;

export const EMPTY_RIDE_FORM: RideFormInput = {
  destination: '',
  departureDate: '',
  departureTime: '',
  rideType: '',
  seats: '',
  description: '',
};
