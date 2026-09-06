import type { SelectOption } from '@design-system';
import { AddIcon, SaveIcon } from '@design-system/icons';

import { seatsLabel } from '@app/pages/Rides/constants';
import { RIDE_TYPE_OPTIONS } from '@app/pages/Rides/helpers/rideType';

import type { RideFormMode } from '../types';

/**
 * O fuso em que a API valida a partida (`Ride.ValidateDepartureDateTime`). Sem
 * ele o formulário julga pelo relógio de quem preenche e aceita o que o
 * servidor recusa.
 */
export const PRODUCT_TIME_ZONE = 'America/Sao_Paulo';

/** Limites do `CreateCaronaDto` e da entidade `Carona`, espelhados no front. */
export const RIDE_LIMITS = {
  minDestination: 3,
  maxDestination: 100,
  maxDescription: 300,
  minSeats: 1,
  maxSeats: 7,
};

export const OFFER_MODE: RideFormMode = {
  title: 'Ofertar carona',
  submitLabel: 'Ofertar carona',
  submitIcon: AddIcon,
  succeeded: 'Carona ofertada.',
  failed: 'Erro ao ofertar a carona. Tente novamente.',
};

export const EDIT_MODE: RideFormMode = {
  title: 'Editar carona',
  submitLabel: 'Salvar alterações',
  submitIcon: SaveIcon,
  succeeded: 'Carona atualizada.',
  failed: 'Erro ao atualizar a carona. Tente novamente.',
};

export const RIDE_FORM_LABELS = {
  destination: 'Destino',
  departure: 'Data e hora',
  rideType: 'Tipo',
  seats: 'Vagas disponíveis',
  description: 'Descrição',
};

export const RIDE_FORM_PLACEHOLDERS = {
  destination: 'Insira o destino',
  select: 'Selecione...',
  description: 'Conte como será a carona',
};

export const DESCRIPTION_ROWS = 3;

const EMPTY_CHOICE: SelectOption = { value: '', label: RIDE_FORM_PLACEHOLDERS.select };

/** As escolhas do campo, já com a opção vazia na frente. */
export const RIDE_TYPE_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...RIDE_TYPE_OPTIONS,
];

const INCLUSIVE_END = 1;

export const SEAT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...Array.from(
    { length: RIDE_LIMITS.maxSeats - RIDE_LIMITS.minSeats + INCLUSIVE_END },
    (_value, index) => {
      const seats = RIDE_LIMITS.minSeats + index;

      return { value: String(seats), label: seatsLabel(seats) };
    },
  ),
];

export const RIDE_FORM_MESSAGES = {
  destinationTooShort: `O destino deve ter ao menos ${RIDE_LIMITS.minDestination} caracteres`,
  destinationTooLong: `O destino deve ter no máximo ${RIDE_LIMITS.maxDestination} caracteres`,
  departureRequired: 'Informe a data e a hora',
  departureInvalid: 'Data e hora inválidas',
  departureInPast: 'A carona deve ser em data e hora futuras',
  rideTypeRequired: 'Selecione o tipo',
  seatsRequired: 'Selecione a quantidade de vagas',
  descriptionTooLong: `A descrição pode ter no máximo ${RIDE_LIMITS.maxDescription} caracteres`,
};
