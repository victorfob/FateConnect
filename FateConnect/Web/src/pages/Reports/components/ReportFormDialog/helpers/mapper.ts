import type { ReportInput } from '@app/services/reports/types';

import type { ReportFormValues } from '../schema';

export function toReportInput(values: ReportFormValues): ReportInput {
  return {
    category: values.category,
    description: values.description,
    isAnonymous: values.isAnonymous,
    image: values.photo,
  };
}
