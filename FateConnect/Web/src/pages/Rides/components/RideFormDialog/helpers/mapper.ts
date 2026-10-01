import { format } from 'date-fns';

import type { Ride, RideInput } from '@app/services/rides/types';
import { toApiDate, toDisplayDate } from '@app/utils/apiDate';
import { firstCharacters } from '@app/utils/sequence';

import { EMPTY_RIDE_FORM, type RideFormInput, type RideFormValues } from '../schema';

/** A API devolve `HH:mm:ss` e o campo mostra `HH:mm`. */
const TIME_LENGTH = 5;
const API_TIME_FORMAT = 'HH:mm';

/** Sem carona é oferta, e o formulário abre vazio. */
export function toFormValues(ride: Ride | undefined): RideFormInput {
  if (!ride) return EMPTY_RIDE_FORM;

  const time = firstCharacters(ride.departureTime, TIME_LENGTH);

  return {
    destination: ride.destination,
    departure: `${toDisplayDate(ride.departureDate)} ${time}`,
    rideType: ride.rideType,
    vehicleType: ride.vehicleType,
    frequency: ride.frequency,
    repeatUntil: toDisplayDate(ride.repeatUntil ?? ''),
    description: ride.description ?? '',
  };
}

/** A API guarda o dia e a hora em campos separados, e o schema entregou os dois juntos. */
export function toRideInput(values: RideFormValues): RideInput {
  const input: RideInput = {
    destination: values.destination,
    departureDate: toApiDate(values.departure),
    departureTime: format(values.departure, API_TIME_FORMAT),
    rideType: values.rideType,
    vehicleType: values.vehicleType,
    frequency: values.frequency,
    description: values.description,
  };

  if (!values.repeatUntil) return input;

  return { ...input, repeatUntil: toApiDate(values.repeatUntil) };
}
