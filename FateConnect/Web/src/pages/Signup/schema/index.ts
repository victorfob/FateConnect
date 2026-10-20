import { z } from 'zod';

import {
  FATEC_EMAIL_DOMAIN_MESSAGE,
  FATEC_EMAIL_DOMAIN_PATTERN,
  FATEC_EMAIL_LOCAL_PART_MESSAGE,
  FATEC_EMAIL_LOCAL_PART_PATTERN,
} from '@app/constants/fatecEmail';

import { EARLIEST_BIRTH_DATE, latestBirthDate, parseBirthDate } from '../helpers/birthDate';

const REQUIRED_MIN_LENGTH = 1;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Comprimento máximo de cada campo, como o `CreateUserDto` os declara. Sem eles
 * a API recusa com o 400 genérico, que não diz qual campo passou do limite.
 */
export const MAX_LENGTH = {
  fullName: 200,
  fatecEmail: 150,
};

export function maxLengthMessage(max: number): string {
  return `Máximo de ${max} caracteres`;
}

/** Mensagens iguais às do produto. */
export const SIGNUP_MESSAGES = {
  fullNameRequired: 'Informe o nome completo',
  fatecEmailRequired: 'Informe o e-mail Fatec',
  birthDateRequired: 'Informe a data de nascimento',
  birthDateInvalid: 'Data inválida',
  birthDateUnderage: 'É necessário ter pelo menos 18 anos',
  passwordRequired: 'Informe a senha',
  passwordTooShort: 'Mínimo de 8 caracteres',
  passwordConfirmationRequired: 'Confirme a senha',
  passwordConfirmationMismatch: 'As senhas não são iguais',
  termsRequired: 'É necessário aceitar os termos de uso e política de privacidade para continuar.',
};

/** Confirmação diferente da senha marca o campo da confirmação, aqui e na nova senha. */
export const PASSWORD_CONFIRMATION_MISMATCH = {
  message: SIGNUP_MESSAGES.passwordConfirmationMismatch,
  path: ['passwordConfirmation'],
};

/** Data real e não anterior ao piso do seletor. */
function isRealBirthDate(value: string): boolean {
  if (value === '') return true;

  const parsed = parseBirthDate(value);
  if (!parsed) return false;

  return parsed >= EARLIEST_BIRTH_DATE;
}

function isOldEnough(value: string): boolean {
  const parsed = parseBirthDate(value);
  if (!parsed) return true;

  return parsed <= latestBirthDate();
}

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.fullNameRequired)
    .max(MAX_LENGTH.fullName, maxLengthMessage(MAX_LENGTH.fullName)),
  fatecEmail: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.fatecEmailRequired)
    .max(MAX_LENGTH.fatecEmail, maxLengthMessage(MAX_LENGTH.fatecEmail))
    .regex(FATEC_EMAIL_DOMAIN_PATTERN, FATEC_EMAIL_DOMAIN_MESSAGE)
    .regex(FATEC_EMAIL_LOCAL_PART_PATTERN, FATEC_EMAIL_LOCAL_PART_MESSAGE),
  birthDate: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.birthDateRequired)
    .refine(isRealBirthDate, SIGNUP_MESSAGES.birthDateInvalid)
    .refine(isOldEnough, SIGNUP_MESSAGES.birthDateUnderage),
  password: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.passwordRequired)
    .min(MIN_PASSWORD_LENGTH, SIGNUP_MESSAGES.passwordTooShort),
  passwordConfirmation: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.passwordConfirmationRequired),
  acceptTerms: z.boolean().refine((accepted) => accepted, SIGNUP_MESSAGES.termsRequired),
  acceptNotifications: z.boolean(),
});

/** As outras telas reaproveitam campos do `signupSchema`, e o `.pick` recusa objeto com refinamento. */
export const signupFormSchema = signupSchema.refine(
  ({ password, passwordConfirmation }) => password === passwordConfirmation,
  PASSWORD_CONFIRMATION_MISMATCH,
);

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const SIGNUP_DEFAULT_VALUES: SignupFormValues = {
  fullName: '',
  fatecEmail: '',
  birthDate: '',
  password: '',
  passwordConfirmation: '',
  acceptTerms: false,
  acceptNotifications: false,
};
