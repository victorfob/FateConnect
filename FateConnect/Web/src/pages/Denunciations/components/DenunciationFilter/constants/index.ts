import type { SelectOption } from '@design-system';

import { DENUNCIATION_STATUS_OPTIONS } from '@app/services/denunciations/denunciationStatus';

export const FILTER_TITLE = 'Filtros';
export const FILTER_SUBMIT_LABEL = 'Filtrar';
export const FILTER_CLEAR_LABEL = 'Limpar';

export const FILTER_LABELS = { status: 'Situação' };

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum DenunciationStatusFilterEnum {
  ALL = '',
}

/** A lista abre em todas, então esta é a opção de partida, e não uma escolha. */
export const DENUNCIATION_STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: DenunciationStatusFilterEnum.ALL, label: 'Todas' },
  ...DENUNCIATION_STATUS_OPTIONS,
];
