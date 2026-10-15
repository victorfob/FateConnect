import { reportCategoryLabel } from '@app/pages/Reports/helpers/reportCategory';
import type { Report } from '@app/services/reports/types';

export const REPORT_CARD_MARKERS = {
  confidential: 'Sigilosa',
};

export function photoAlt({ category }: Report): string {
  return `Foto anexada à denúncia de ${reportCategoryLabel(category).toLowerCase()}`;
}
