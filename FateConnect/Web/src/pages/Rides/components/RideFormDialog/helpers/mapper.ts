import type { Ride, RideInput } from '@app/services/rides/types';

import { EMPTY_RIDE_FORM, type RideFormInput, type RideFormValues } from '../schema';

/** `aaaa-mm-dd` da API; o resto do carimbo, quando vier, não serve ao campo. */
const DATE_LENGTH = 10;
/** A API devolve `HH:mm:ss` e o campo de hora só aceita `HH:mm`. */
const TIME_LENGTH = 5;

/** Sem carona é oferta, e o formulário abre vazio. */
export function toFormValues(ride: Ride | undefined): RideFormInput {
  if (!ride) return EMPTY_RIDE_FORM;

  return {
    destination: ride.destination,
    departureDate: ride.departureDate.slice(0, DATE_LENGTH),
    departureTime: ride.departureTime.slice(0, TIME_LENGTH),
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
    departureDate: values.departureDate,
    departureTime: values.departureTime,
    rideType: values.rideType,
    description: values.description,
  };
}
