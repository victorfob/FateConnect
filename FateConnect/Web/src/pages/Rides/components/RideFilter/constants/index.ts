import { RIDE_TYPE_OPTIONS } from '@app/pages/Rides/helpers/rideType';

export const FILTER_PANEL_TITLE = 'Filtros';
export const FILTER_SUBMIT_LABEL = 'Filtrar';

export const FILTER_LABELS = {
  departureDate: 'Data',
  departureTime: 'Hora',
  destination: 'Destino',
  rideType: 'Tipo',
};

export const FILTER_PLACEHOLDERS = { destination: 'Digite o destino', rideType: 'Selecione' };

export const TIME_PICKER_LABEL = 'Abrir seletor de horário';

export const RIDE_TYPE_HELP =
  'Filtrar por tipo de carona: Solidária, com caronas totalmente gratuitas, ou Igualitária, em que os participantes dividem os custos.';

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum RideTypeFilterEnum {
  ALL = '',
}

/** A sentinela do filtro na frente das mesmas escolhas que o formulário oferece. */
export const RIDE_TYPE_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: RideTypeFilterEnum.ALL, label: 'Todas' },
  ...RIDE_TYPE_OPTIONS,
];
