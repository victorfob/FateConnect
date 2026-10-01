import { onlyDigits } from '@design-system';
import { z } from 'zod';

import { maxLengthMessage } from '@app/pages/Signup/schema';

import { CONTACT_MESSAGES, MAX_CONTACT_EMAIL_LENGTH } from '../constants';

const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 11;

type ContactValues = { phone: string; contactEmail: string; contactIsRequired: boolean };

function hasBrazilianPhoneLength(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits === '') return true;

  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}

function isEmailOrEmpty(value: string): boolean {
  if (value === '') return true;

  return z.email().safeParse(value).success;
}

/** Os campos do contato, para o formulário que os monta estender. */
export const contactFieldsSchema = z.object({
  phone: z.string().refine(hasBrazilianPhoneLength, CONTACT_MESSAGES.phoneInvalid),
  contactEmail: z
    .string()
    .trim()
    .max(MAX_CONTACT_EMAIL_LENGTH, maxLengthMessage(MAX_CONTACT_EMAIL_LENGTH))
    .refine(isEmailOrEmpty, CONTACT_MESSAGES.contactEmailInvalid),
  contactIsRequired: z.boolean(),
});

/** Telefone e e-mail vão juntos ou nenhum; quem já tem contato não o apaga, só troca. */
export function checkContact(values: ContactValues, context: z.RefinementCtx) {
  const hasPhone = onlyDigits(values.phone) !== '';
  const hasContactEmail = values.contactEmail.trim() !== '';
  if (!values.contactIsRequired && !hasPhone && !hasContactEmail) return;

  if (!hasPhone)
    context.addIssue({ code: 'custom', path: ['phone'], message: CONTACT_MESSAGES.phoneRequired });

  if (!hasContactEmail)
    context.addIssue({
      code: 'custom',
      path: ['contactEmail'],
      message: CONTACT_MESSAGES.contactEmailRequired,
    });
}
