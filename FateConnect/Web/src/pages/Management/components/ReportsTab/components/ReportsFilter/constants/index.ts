import type { SelectOption } from '@design-system';

import { REPORT_CATEGORY_OPTIONS } from '@app/pages/Reports/helpers/reportCategory';
import { REPORT_STATUS_OPTIONS } from '@app/services/reports/reportStatus';

/** A busca casa só a descrição, então o rótulo não promete mais que isso. */
export const FILTER_LABELS = {
  searchTerm: 'Descrição',
  period: 'Período',
  category: 'Motivo',
  status: 'Situação',
};

export const FILTER_PLACEHOLDERS = { searchTerm: 'O que foi relatado' };

/** Sentinela do formulário: não vai para a requisição. */
export enum ReportFilterEnum {
  ALL = '',
}

export const CATEGORY_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: ReportFilterEnum.ALL, label: 'Todos' },
  ...REPORT_CATEGORY_OPTIONS,
];

export const STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: ReportFilterEnum.ALL, label: 'Todas' },
  ...REPORT_STATUS_OPTIONS,
];
