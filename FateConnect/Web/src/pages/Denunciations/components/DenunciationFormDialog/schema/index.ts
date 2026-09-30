import { z } from 'zod';

import { photoSchema } from '@app/components/PhotoField/schema';
import { isDenunciationCategory } from '@app/pages/Denunciations/helpers/denunciationCategory';

import { DENUNCIATION_FORM_MESSAGES, DENUNCIATION_LIMITS } from '../constants';

export const denunciationFormSchema = z.object({
  category: z.string().refine(isDenunciationCategory, DENUNCIATION_FORM_MESSAGES.categoryRequired),
  description: z
    .string()
    .trim()
    .min(DENUNCIATION_LIMITS.minDescription, DENUNCIATION_FORM_MESSAGES.descriptionTooShort)
    .max(DENUNCIATION_LIMITS.maxDescription, DENUNCIATION_FORM_MESSAGES.descriptionTooLong),
  isAnonymous: z.boolean(),
  photo: photoSchema,
});

export type DenunciationFormInput = z.input<typeof denunciationFormSchema>;
export type DenunciationFormValues = z.output<typeof denunciationFormSchema>;

export const EMPTY_DENUNCIATION_FORM: DenunciationFormInput = {
  category: '',
  description: '',
  isAnonymous: false,
  photo: null,
};
