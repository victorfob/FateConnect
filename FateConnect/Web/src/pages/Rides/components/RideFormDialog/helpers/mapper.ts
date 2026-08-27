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
    destination: ride.destino,
    departureDate: ride.dataPartida.slice(0, DATE_LENGTH),
    departureTime: ride.horaPartida.slice(0, TIME_LENGTH),
    rideType: ride.tipoCarona,
    seats: String(ride.qtdVagas),
    description: ride.descricao ?? '',
  };
}

/** O schema já entregou os campos aparados e o tipo estreitado. */
export function toRideInput(values: RideFormValues): RideInput {
  return {
    qtdVagas: Number(values.seats),
    destino: values.destination,
    dataPartida: values.departureDate,
    horaPartida: values.departureTime,
    tipoCarona: values.rideType,
    descricao: values.description,
  };
}
