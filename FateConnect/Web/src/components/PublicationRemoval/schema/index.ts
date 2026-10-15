import { z } from 'zod';

import { REMOVAL_DIALOG } from '../constants';
import { isRemovalReason } from '../helpers';

export const removalFormSchema = z.object({
  reason: z.string().refine(isRemovalReason, REMOVAL_DIALOG.reasonRequired),
});

export type RemovalFormInput = z.input<typeof removalFormSchema>;
export type RemovalFormValues = z.output<typeof removalFormSchema>;

export const EMPTY_REMOVAL_FORM: RemovalFormInput = { reason: '' };
