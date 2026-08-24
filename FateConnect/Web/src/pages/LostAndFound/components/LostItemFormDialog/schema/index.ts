import { isAfter, isValid, parseISO, startOfDay } from 'date-fns';
import { z } from 'zod';

import { isLostItemKind } from '@app/pages/LostAndFound/helpers/lostItemKind';

import {
  ACCEPTED_PHOTO_TYPES,
  LOST_ITEM_FORM_MESSAGES,
  LOST_ITEM_LIMITS,
  MAX_PHOTO_BYTES,
} from '../constants';

const REQUIRED = 1;

/**
 * Só se cadastra o que já aconteceu. Campo vazio ou ilegível passa: quem reclama
 * disso é a regra de obrigatoriedade, e acumular as duas mensagens no mesmo
 * lugar só confunde quem está preenchendo.
 */
function hasAlreadyHappened(value: string): boolean {
  if (!value) return true;

  const occurred = parseISO(value);
  if (!isValid(occurred)) return true;

  return !isAfter(startOfDay(occurred), startOfDay(new Date()));
}

/** A foto é opcional, então não escolher nenhuma é um estado válido. */
function isAcceptedPhotoFormat(photo: File | null): boolean {
  if (!photo) return true;

  return ACCEPTED_PHOTO_TYPES.has(photo.type);
}

function isWithinPhotoSize(photo: File | null): boolean {
  if (!photo) return true;

  return photo.size <= MAX_PHOTO_BYTES;
}

export const lostItemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LOST_ITEM_LIMITS.minName, LOST_ITEM_FORM_MESSAGES.nameTooShort)
    .max(LOST_ITEM_LIMITS.maxName, LOST_ITEM_FORM_MESSAGES.nameTooLong),
  // O predicado estreita a saída: o formulário guarda texto, o schema entrega
  // `LostItemKindEnum`, e o mapeamento para a requisição não precisa converter.
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
  // A validação já é a do servidor: enquanto a #106 não guarda o arquivo, ela é
  // o que impede o usuário de escolher algo que depois seria recusado.
  photo: z
    .instanceof(File)
    .nullable()
    .refine(isAcceptedPhotoFormat, LOST_ITEM_FORM_MESSAGES.photoFormatInvalid)
    .refine(isWithinPhotoSize, LOST_ITEM_FORM_MESSAGES.photoTooLarge),
});

/** O que os campos guardam: texto, mais o arquivo escolhido. */
export type LostItemFormInput = z.input<typeof lostItemFormSchema>;
/** O que sai validado, já com o tipo do item estreitado. */
export type LostItemFormValues = z.output<typeof lostItemFormSchema>;

export const EMPTY_LOST_ITEM_FORM: LostItemFormInput = {
  name: '',
  kind: '',
  place: '',
  occurredOn: '',
  description: '',
  photo: null,
};
