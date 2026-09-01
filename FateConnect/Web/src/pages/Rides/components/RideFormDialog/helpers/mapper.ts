import type { Ride, RideInput } from '@app/services/rides/types';
import { toApiDateText, toDisplayDate } from '@app/utils/apiDate';
import { firstCharacters } from '@app/utils/sequence';

import { EMPTY_RIDE_FORM, type RideFormInput, type RideFormValues } from '../schema';

/** A API devolve `HH:mm:ss` e o campo de hora só aceita `HH:mm`. */
const TIME_LENGTH = 5;

/** Sem carona é oferta, e o formulário abre vazio. */
export function toFormValues(ride: Ride | undefined): RideFormInput {
  if (!ride) return EMPTY_RIDE_FORM;

  return {
    destination: ride.destination,
    departureDate: toDisplayDate(ride.departureDate),
    departureTime: firstCharacters(ride.departureTime, TIME_LENGTH),
    rideType: ride.rideType,
    seats: String(ride.availableSeats),
    description: ride.description ?? '',
  };
}

/** O schema já entregou os campos aparados e o tipo estreitado. */
export function toRideInput(values: RideFormValues): RideInput {
  return {
    availableSeats: Number(values.seats),
    destination: values.destination,
    departureDate: toApiDateText(values.departureDate),
    departureTime: values.departureTime,
    rideType: values.rideType,
    description: values.description,
  };
}
