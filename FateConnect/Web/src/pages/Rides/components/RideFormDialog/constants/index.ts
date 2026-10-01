import type { SelectOption } from '@design-system';
import { AddIcon, SaveIcon } from '@design-system/icons';

import { SELECT_PLACEHOLDER } from '@app/constants/selectPlaceholder';
import { RIDE_FREQUENCY_OPTIONS } from '@app/pages/Rides/helpers/rideFrequency';
import { RIDE_TYPE_OPTIONS } from '@app/pages/Rides/helpers/rideType';
import { VEHICLE_TYPE_OPTIONS } from '@app/pages/Rides/helpers/rideVehicle';

import type { RideFormMode } from '../types';

/**
 * O fuso em que a API valida a partida (`Ride.ValidateDepartureDateTime`). Sem
 * ele o formulário julga pelo relógio de quem preenche e aceita o que o
 * servidor recusa.
 */
export const PRODUCT_TIME_ZONE = 'America/Sao_Paulo';

/** Limites do `CreateRideDto` e da entidade `Ride`, espelhados no front. */
export const RIDE_LIMITS = {
  minDestination: 3,
  maxDestination: 100,
  maxDescription: 300,
  /** Teto da data final, contado da partida, como a API recusa. */
  maxRecurrenceMonths: 6,
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
  recurrenceStart: 'Data e hora iniciais',
  rideType: 'Tipo',
  vehicleType: 'Veículo',
  frequency: 'Recorrência',
  repeatUntil: 'Data final da recorrência',
  description: 'Descrição',
};

export const RIDE_FORM_PLACEHOLDERS = {
  destination: 'Insira o destino',
  description: 'Conte como será a carona',
};

export const DESCRIPTION_ROWS = 3;

/** Chave do cache dos feriados, um ano por entrada: eles não mudam dentro do ano. */
export const HOLIDAYS_QUERY_KEY = 'holidays';

export const HOLIDAYS_LOAD_FAILED = 'Erro ao carregar os feriados. Tente novamente.';

const EMPTY_CHOICE: SelectOption = { value: '', label: SELECT_PLACEHOLDER };

/** As escolhas do campo, já com a opção vazia na frente. */
export const RIDE_TYPE_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...RIDE_TYPE_OPTIONS,
];

export const VEHICLE_TYPE_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...VEHICLE_TYPE_OPTIONS,
];

/** Sem opção vazia: o campo abre em uma vez só, a carona de sempre. */
export const RIDE_FREQUENCY_SELECT_OPTIONS: readonly SelectOption[] = RIDE_FREQUENCY_OPTIONS;

export const RIDE_FORM_MESSAGES = {
  destinationTooShort: `O destino deve ter ao menos ${RIDE_LIMITS.minDestination} caracteres`,
  destinationTooLong: `O destino deve ter no máximo ${RIDE_LIMITS.maxDestination} caracteres`,
  departureRequired: 'Informe a data e a hora',
  departureInvalid: 'Data e hora inválidas',
  departureInPast: 'A carona deve ser em data e hora futuras',
  rideTypeRequired: 'Selecione o tipo',
  vehicleTypeRequired: 'Selecione o veículo',
  frequencyRequired: 'Selecione a recorrência',
  departureOnWeekend: 'A recorrência em dias úteis começa num dia útil',
  departureOnHoliday: 'Escolha um dia que não seja feriado',
  repeatUntilRequired: 'Informe a data final da recorrência',
  repeatUntilInvalid: 'Data inválida',
  repeatUntilBeforeDeparture: 'A data final não pode ser anterior à partida',
  repeatUntilTooFar: `A recorrência vai até no máximo ${RIDE_LIMITS.maxRecurrenceMonths} meses depois da partida`,
  descriptionTooLong: `A descrição pode ter no máximo ${RIDE_LIMITS.maxDescription} caracteres`,
};
