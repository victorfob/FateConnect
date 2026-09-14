import { z } from 'zod';

import { isDenunciationCategory } from '@app/pages/Denunciations/helpers/denunciationCategory';

import {
  ACCEPTED_PHOTO_TYPES,
  DENUNCIATION_FORM_MESSAGES,
  DENUNCIATION_LIMITS,
  MAX_PHOTO_BYTES,
} from '../constants';

function isAcceptedPhotoFormat(photo: File | null): boolean {
  if (!photo) return true;

  return ACCEPTED_PHOTO_TYPES.has(photo.type);
}

function isWithinPhotoSize(photo: File | null): boolean {
  if (!photo) return true;

  return photo.size <= MAX_PHOTO_BYTES;
}

export const denunciationFormSchema = z.object({
  category: z.string().refine(isDenunciationCategory, DENUNCIATION_FORM_MESSAGES.categoryRequired),
  description: z
    .string()
    .trim()
    .min(DENUNCIATION_LIMITS.minDescription, DENUNCIATION_FORM_MESSAGES.descriptionTooShort)
    .max(DENUNCIATION_LIMITS.maxDescription, DENUNCIATION_FORM_MESSAGES.descriptionTooLong),
  isAnonymous: z.boolean(),
  photo: z
    .instanceof(File)
    .nullable()
    .refine(isAcceptedPhotoFormat, DENUNCIATION_FORM_MESSAGES.photoFormatInvalid)
    .refine(isWithinPhotoSize, DENUNCIATION_FORM_MESSAGES.photoTooLarge),
});

export type DenunciationFormInput = z.input<typeof denunciationFormSchema>;
export type DenunciationFormValues = z.output<typeof denunciationFormSchema>;

export const EMPTY_DENUNCIATION_FORM: DenunciationFormInput = {
  category: '',
  description: '',
  isAnonymous: false,
  photo: null,
};
