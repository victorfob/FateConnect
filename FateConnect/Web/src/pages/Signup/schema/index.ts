import { z } from 'zod';

import { onlyDigits } from '@app/utils/masks/caret';
import { EARLIEST_BIRTH_DATE, latestBirthDate, parseBirthDate } from '../helpers/birthDate';

const MIN_PASSWORD_LENGTH = 8;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 11;

/** Mensagens iguais às do produto. */
export const SIGNUP_MESSAGES = {
  fullNameRequired: 'Informe o nome completo',
  fatecEmailRequired: 'Informe o e-mail Fatec',
  emailInvalid: 'E-mail inválido',
  birthDateRequired: 'Informe a data de nascimento',
  birthDateInvalid: 'Data inválida',
  birthDateUnderage: 'É necessário ter pelo menos 18 anos',
  genderRequired: 'Selecione o gênero',
  passwordRequired: 'Informe a senha',
  passwordTooShort: 'Mínimo de 8 caracteres',
  phoneRequired: 'Informe o telefone',
  phoneInvalid: 'Telefone com DDD: 10 ou 11 dígitos',
  contactEmailRequired: 'Informe o e-mail',
  termsRequired: 'É necessário aceitar os termos de uso e política de privacidade para continuar.',
};

/** Data real e não anterior ao piso do seletor. */
function isRealBirthDate(value: string): boolean {
  if (value.length === 0) return true;

  const parsed = parseBirthDate(value);
  if (!parsed) return false;

  return parsed >= EARLIEST_BIRTH_DATE;
}

function isOldEnough(value: string): boolean {
  const parsed = parseBirthDate(value);
  if (!parsed) return true;

  return parsed <= latestBirthDate();
}

function hasBrazilianPhoneLength(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 0) return true;

  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}

export const signupSchema = z.object({
  fullName: z.string().min(1, SIGNUP_MESSAGES.fullNameRequired),
  nickname: z.string(),
  fatecEmail: z
    .string()
    .min(1, SIGNUP_MESSAGES.fatecEmailRequired)
    .pipe(z.email(SIGNUP_MESSAGES.emailInvalid)),
  birthDate: z
    .string()
    .min(1, SIGNUP_MESSAGES.birthDateRequired)
    .refine(isRealBirthDate, SIGNUP_MESSAGES.birthDateInvalid)
    .refine(isOldEnough, SIGNUP_MESSAGES.birthDateUnderage),
  gender: z.string().min(1, SIGNUP_MESSAGES.genderRequired),
  password: z
    .string()
    .min(1, SIGNUP_MESSAGES.passwordRequired)
    .min(MIN_PASSWORD_LENGTH, SIGNUP_MESSAGES.passwordTooShort),
  zipCode: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  complement: z.string(),
  phone: z
    .string()
    .min(1, SIGNUP_MESSAGES.phoneRequired)
    .refine(hasBrazilianPhoneLength, SIGNUP_MESSAGES.phoneInvalid),
  contactEmail: z
    .string()
    .min(1, SIGNUP_MESSAGES.contactEmailRequired)
    .pipe(z.email(SIGNUP_MESSAGES.emailInvalid)),
  acceptTerms: z.boolean().refine((accepted) => accepted, SIGNUP_MESSAGES.termsRequired),
  acceptMarketing: z.boolean(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const SIGNUP_DEFAULT_VALUES: SignupFormValues = {
  fullName: '',
  nickname: '',
  fatecEmail: '',
  birthDate: '',
  gender: '',
  password: '',
  zipCode: '',
  state: '',
  city: '',
  street: '',
  streetNumber: '',
  complement: '',
  phone: '',
  contactEmail: '',
  acceptTerms: false,
  acceptMarketing: false,
};
