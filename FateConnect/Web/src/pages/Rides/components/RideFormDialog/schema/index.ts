import { isValid, parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';

import { isRideType } from '@app/pages/Rides/helpers/rideType';

import { PRODUCT_TIME_ZONE, RIDE_FORM_MESSAGES, RIDE_LIMITS } from '../constants';

const REQUIRED = 1;
/** O campo entrega o que a pessoa digitou, não o formato da API. */
const DEPARTURE_FORMAT = 'dd/MM/yyyy HH:mm';

function isSeatCount(value: string): boolean {
  const seats = Number(value);

  return Number.isInteger(seats) && seats >= RIDE_LIMITS.minSeats && seats <= RIDE_LIMITS.maxSeats;
}

function parseDeparture(departure: string): Date {
  return parse(departure, DEPARTURE_FORMAT, new Date());
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

export const rideFormSchema = z.object({
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
  seats: z.string().refine(isSeatCount, RIDE_FORM_MESSAGES.seatsRequired),
  description: z
    .string()
    .trim()
    .max(RIDE_LIMITS.maxDescription, RIDE_FORM_MESSAGES.descriptionTooLong),
});

/** O que os campos guardam: tudo texto, inclusive a partida. */
export type RideFormInput = z.input<typeof rideFormSchema>;
/** O que sai validado, já com a partida lida e o tipo de carona estreitado. */
export type RideFormValues = z.output<typeof rideFormSchema>;

export const EMPTY_RIDE_FORM: RideFormInput = {
  destination: '',
  departure: '',
  rideType: '',
  seats: '',
  description: '',
};
