import { onlyDigits } from '@design-system';

import type { SignupRequest } from '@app/services/signup/types';

import type { SignupFormValues } from '../schema';
import { parseBirthDate, toApiBirthDate } from './birthDate';

/** Campo opcional: o backend prefere a ausência da chave a uma string vazia. */
function optionalText(value: string): string | undefined {
  if (value === '') return undefined;

  return value;
}

/** O schema já garantiu a data; o vazio só existe para o tipo fechar. */
function toApiBirthDateOrEmpty(value: string): string {
  const parsed = parseBirthDate(value);
  if (!parsed) return '';

  return toApiBirthDate(parsed);
}

export function toSignupRequest(values: SignupFormValues): SignupRequest {
  return {
    fullName: values.fullName,
    nickname: optionalText(values.nickname),
    fatecEmail: values.fatecEmail,
    password: values.password,
    birthDate: toApiBirthDateOrEmpty(values.birthDate),
    gender: values.gender,
    addresses: [
      {
        zipCode: values.zipCode,
        street: values.street,
        streetNumber: values.streetNumber,
        complement: values.complement,
        city: values.city,
        state: values.state,
      },
    ],
    contacts: [
      {
        phone: onlyDigits(values.phone),
        contactEmail: values.contactEmail,
      },
    ],
  };
}
