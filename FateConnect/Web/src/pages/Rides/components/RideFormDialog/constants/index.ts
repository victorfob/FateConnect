import { seatsLabel } from '@app/pages/Rides/constants';
import { RIDE_TYPE_OPTIONS } from '@app/pages/Rides/helpers/rideType';
import type { SelectOption } from '@design-system';
import { AddIcon, SaveIcon } from '@design-system/icons';

import type { RideFormMode } from '../types';

/** Limites do `CreateCaronaDto` e da entidade `Carona`, espelhados no front. */
export const RIDE_LIMITS = {
  minDestination: 3,
  maxDestination: 100,
  maxDescription: 300,
  minSeats: 1,
  maxSeats: 7,
};

export const OFFER_MODE: RideFormMode = {
  title: 'Ofertar Carona',
  submitLabel: 'Ofertar Carona',
  submitIcon: AddIcon,
  succeeded: 'Carona ofertada com sucesso.',
  failed: 'Erro ao ofertar a carona. Tente novamente.',
};

export const EDIT_MODE: RideFormMode = {
  title: 'Editar Carona',
  submitLabel: 'Salvar Alterações',
  submitIcon: SaveIcon,
  succeeded: 'Carona atualizada com sucesso.',
  failed: 'Erro ao atualizar a carona. Tente novamente.',
};

export const RIDE_FORM_LABELS = {
  destination: 'Destino',
  departureDate: 'Data',
  departureTime: 'Hora',
  rideType: 'Tipo',
  seats: 'Vagas Disponíveis',
  description: 'Descrição',
};

export const RIDE_FORM_PLACEHOLDERS = {
  destination: 'Digite o destino',
  select: 'Selecione',
  description: 'Conte como será a carona',
};

export const DESCRIPTION_ROWS = 3;

const EMPTY_CHOICE: SelectOption = { value: '', label: RIDE_FORM_PLACEHOLDERS.select };

/** As escolhas do campo, já com a opção vazia na frente. */
export const RIDE_TYPE_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...RIDE_TYPE_OPTIONS,
];

export const SEAT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...Array.from({ length: RIDE_LIMITS.maxSeats - RIDE_LIMITS.minSeats + 1 }, (_value, index) => {
    const seats = RIDE_LIMITS.minSeats + index;

    return { value: String(seats), label: seatsLabel(seats) };
  }),
];

export const RIDE_FORM_MESSAGES = {
  destinationTooShort: `O destino deve ter ao menos ${RIDE_LIMITS.minDestination} caracteres`,
  destinationTooLong: `O destino deve ter no máximo ${RIDE_LIMITS.maxDestination} caracteres`,
  departureDateRequired: 'Informe a data',
  departureTimeRequired: 'Informe a hora',
  departureInPast: 'A carona deve ser em data e hora futuras',
  rideTypeRequired: 'Selecione o tipo',
  seatsRequired: 'Selecione a quantidade de vagas',
  descriptionTooLong: `A descrição pode ter no máximo ${RIDE_LIMITS.maxDescription} caracteres`,
};
