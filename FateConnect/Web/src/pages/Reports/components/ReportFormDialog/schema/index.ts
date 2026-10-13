import { z } from 'zod';

import { photoSchema } from '@app/components/PhotoField/schema';
import { isReportCategory } from '@app/pages/Reports/helpers/reportCategory';

import { REPORT_FORM_MESSAGES, REPORT_LIMITS } from '../constants';

export const reportFormSchema = z.object({
  category: z.string().refine(isReportCategory, REPORT_FORM_MESSAGES.categoryRequired),
  description: z
    .string()
    .trim()
    .min(REPORT_LIMITS.minDescription, REPORT_FORM_MESSAGES.descriptionTooShort)
    .max(REPORT_LIMITS.maxDescription, REPORT_FORM_MESSAGES.descriptionTooLong),
  isAnonymous: z.boolean(),
  photo: photoSchema,
});

export type ReportFormInput = z.input<typeof reportFormSchema>;
export type ReportFormValues = z.output<typeof reportFormSchema>;

export const EMPTY_REPORT_FORM: ReportFormInput = {
  category: '',
  description: '',
  isAnonymous: false,
  photo: null,
};
