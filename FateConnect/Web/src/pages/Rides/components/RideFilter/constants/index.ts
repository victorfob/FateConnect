import type { SelectOption } from '@design-system';

import { RIDE_SHIFT_OPTIONS } from '@app/pages/Rides/helpers/rideShift';
import { RIDE_TYPE_OPTIONS } from '@app/pages/Rides/helpers/rideType';

export const FILTER_TITLE = 'Filtros';
export const FILTER_SUBMIT_LABEL = 'Filtrar';
export const FILTER_CLEAR_LABEL = 'Limpar';

export const FILTER_LABELS = {
  period: 'Período',
  departureShift: 'Turno',
  searchTerm: 'Destino ou descrição',
  rideType: 'Tipo',
  owner: 'Quem ofertou',
};

export const FILTER_PLACEHOLDERS = { searchTerm: 'Insira o destino ou parte da descrição' };

export const RIDE_TYPE_HELP =
  'Solidária: a carona é gratuita. Igualitária: os participantes dividem os custos.';

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum RideTypeFilterEnum {
  ALL = '',
}

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum RideShiftFilterEnum {
  ALL = '',
}

/** Quem ofertou não é campo da entidade: só `MINE` vira `onlyMine` na requisição. */
export enum RideOwnerFilterEnum {
  ALL = '',
  MINE = 'mine',
}

/** A sentinela do filtro na frente das mesmas escolhas que o formulário oferece. */
export const RIDE_TYPE_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: RideTypeFilterEnum.ALL, label: 'Todas' },
  ...RIDE_TYPE_OPTIONS,
];

/** A sentinela na frente dos turnos que a API sabe resolver. */
export const RIDE_SHIFT_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: RideShiftFilterEnum.ALL, label: 'Todos' },
  ...RIDE_SHIFT_OPTIONS,
];

export const RIDE_OWNER_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: RideOwnerFilterEnum.ALL, label: 'Todas as caronas' },
  { value: RideOwnerFilterEnum.MINE, label: 'Minhas caronas' },
];
