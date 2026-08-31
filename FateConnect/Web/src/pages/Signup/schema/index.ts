import { onlyDigits } from '@design-system';
import { z } from 'zod';

import { FATEC_EMAIL_MESSAGE, FATEC_EMAIL_PATTERN } from '@app/constants/fatecEmail';

import { EARLIEST_BIRTH_DATE, latestBirthDate, parseBirthDate } from '../helpers/birthDate';

const REQUIRED_MIN_LENGTH = 1;
const MIN_PASSWORD_LENGTH = 8;
const MIN_PHONE_DIGITS = 10;
const ZIP_CODE_DIGITS = 8;
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
  zipCodeRequired: 'Informe o CEP',
  zipCodeIncomplete: 'CEP incompleto',
  stateRequired: 'Selecione o estado',
  cityRequired: 'Informe a cidade',
  streetRequired: 'Informe o logradouro',
  streetNumberRequired: 'Informe o número',
  termsRequired: 'É necessário aceitar os termos de uso e política de privacidade para continuar.',
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

function isCompleteZipCode(value: string): boolean {
  return onlyDigits(value).length === ZIP_CODE_DIGITS;
}

function hasBrazilianPhoneLength(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits === '') return true;

  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}

export const signupSchema = z.object({
  fullName: z.string().min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.fullNameRequired),
  nickname: z.string(),
  fatecEmail: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.fatecEmailRequired)
    .regex(FATEC_EMAIL_PATTERN, FATEC_EMAIL_MESSAGE),
  birthDate: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.birthDateRequired)
    .refine(isRealBirthDate, SIGNUP_MESSAGES.birthDateInvalid)
    .refine(isOldEnough, SIGNUP_MESSAGES.birthDateUnderage),
  gender: z.string().min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.genderRequired),
  password: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.passwordRequired)
    .min(MIN_PASSWORD_LENGTH, SIGNUP_MESSAGES.passwordTooShort),
  zipCode: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.zipCodeRequired)
    .refine(isCompleteZipCode, SIGNUP_MESSAGES.zipCodeIncomplete),
  state: z.string().min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.stateRequired),
  city: z.string().min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.cityRequired),
  street: z.string().min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.streetRequired),
  streetNumber: z.string().min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.streetNumberRequired),
  complement: z.string(),
  phone: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.phoneRequired)
    .refine(hasBrazilianPhoneLength, SIGNUP_MESSAGES.phoneInvalid),
  contactEmail: z
    .string()
    .min(REQUIRED_MIN_LENGTH, SIGNUP_MESSAGES.contactEmailRequired)
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
