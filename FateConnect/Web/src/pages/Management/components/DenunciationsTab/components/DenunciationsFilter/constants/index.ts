import type { SelectOption } from '@design-system';

import { DENUNCIATION_CATEGORY_OPTIONS } from '@app/pages/Denunciations/helpers/denunciationCategory';
import { DENUNCIATION_STATUS_OPTIONS } from '@app/services/denunciations/denunciationStatus';

export const FILTER_TITLE = 'Filtros';
export const FILTER_SUBMIT_LABEL = 'Filtrar';
export const FILTER_CLEAR_LABEL = 'Limpar';

/** A busca casa só a descrição, então o rótulo não promete mais que isso. */
export const FILTER_LABELS = {
  searchTerm: 'Descrição',
  period: 'Período',
  category: 'Motivo',
  status: 'Situação',
};

export const FILTER_PLACEHOLDERS = { searchTerm: 'O que foi relatado' };

/** Sentinela do formulário: não vai para a requisição. */
export enum DenunciationFilterEnum {
  ALL = '',
}

export const CATEGORY_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: DenunciationFilterEnum.ALL, label: 'Todos' },
  ...DENUNCIATION_CATEGORY_OPTIONS,
];

export const STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: DenunciationFilterEnum.ALL, label: 'Todas' },
  ...DENUNCIATION_STATUS_OPTIONS,
];
