import type { SelectOption } from '@design-system';

import { REPORT_STATUS_OPTIONS } from '@app/services/reports/reportStatus';

export const FILTER_LABELS = { status: 'Situação' };

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum ReportStatusFilterEnum {
  ALL = '',
}

/** A lista abre em todas, então esta é a opção de partida, e não uma escolha. */
export const REPORT_STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: ReportStatusFilterEnum.ALL, label: 'Todas' },
  ...REPORT_STATUS_OPTIONS,
];
