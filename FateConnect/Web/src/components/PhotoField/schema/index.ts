import { z } from 'zod';

import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES, PHOTO_MESSAGES } from '../constants';

function isAcceptedPhotoFormat(photo: File | null): boolean {
  if (!photo) return true;

  return ACCEPTED_PHOTO_TYPES.has(photo.type);
}

function isWithinPhotoSize(photo: File | null): boolean {
  if (!photo) return true;

  return photo.size <= MAX_PHOTO_BYTES;
}

/** A foto é opcional em todo formulário que a recebe. */
export const photoSchema = z
  .instanceof(File)
  .nullable()
  .refine(isAcceptedPhotoFormat, PHOTO_MESSAGES.formatInvalid)
  .refine(isWithinPhotoSize, PHOTO_MESSAGES.tooLarge);
