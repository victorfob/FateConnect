import { RideTypeEnum } from '@app/services/rides/types';

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
  'Filtrar por tipo de carona: Filantrópica, com caronas totalmente gratuitas, ou Igualitária, em que os participantes dividem os custos.';

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum RideTypeFilterEnum {
  ALL = '',
}

export const RIDE_TYPE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: RideTypeFilterEnum.ALL, label: 'Todas' },
  { value: RideTypeEnum.PHILANTHROPIC, label: 'Filantrópica' },
  { value: RideTypeEnum.EGALITARIAN, label: 'Igualitária' },
];
