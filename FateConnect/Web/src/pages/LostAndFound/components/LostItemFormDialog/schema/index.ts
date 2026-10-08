import { isAfter, isValid, parse, startOfDay } from 'date-fns';
import { z } from 'zod';

import { photoSchema } from '@app/components/PhotoField/schema';
import { isLostItemKind } from '@app/pages/LostAndFound/helpers/lostItemKind';

import { LOST_ITEM_FORM_MESSAGES, LOST_ITEM_LIMITS } from '../constants';

const REQUIRED = 1;
/** O campo entrega o que a pessoa digitou, não o formato da API. */
const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

/** Campo vazio passa de propósito: quem reclama disso é a obrigatoriedade. */
function hasAlreadyHappened(value: string): boolean {
  if (!value) return true;

  const occurred = parse(value, DISPLAY_DATE_FORMAT, new Date());
  if (!isValid(occurred)) return true;

  return !isAfter(startOfDay(occurred), startOfDay(new Date()));
}

export const lostItemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LOST_ITEM_LIMITS.minName, LOST_ITEM_FORM_MESSAGES.nameTooShort)
    .max(LOST_ITEM_LIMITS.maxName, LOST_ITEM_FORM_MESSAGES.nameTooLong),
  kind: z.string().refine(isLostItemKind, LOST_ITEM_FORM_MESSAGES.kindRequired),
  place: z
    .string()
    .trim()
    .min(LOST_ITEM_LIMITS.minPlace, LOST_ITEM_FORM_MESSAGES.placeTooShort)
    .max(LOST_ITEM_LIMITS.maxPlace, LOST_ITEM_FORM_MESSAGES.placeTooLong),
  occurredOn: z
    .string()
    .min(REQUIRED, LOST_ITEM_FORM_MESSAGES.occurredOnRequired)
    .refine(hasAlreadyHappened, LOST_ITEM_FORM_MESSAGES.occurredOnInFuture),
  description: z
    .string()
    .trim()
    .max(LOST_ITEM_LIMITS.maxDescription, LOST_ITEM_FORM_MESSAGES.descriptionTooLong),
  photo: photoSchema,
  removeStoredPhoto: z.boolean(),
});

export type LostItemFormInput = z.input<typeof lostItemFormSchema>;
export type LostItemFormValues = z.output<typeof lostItemFormSchema>;

export const EMPTY_LOST_ITEM_FORM: LostItemFormInput = {
  name: '',
  kind: '',
  place: '',
  occurredOn: '',
  description: '',
  photo: null,
  removeStoredPhoto: false,
};
