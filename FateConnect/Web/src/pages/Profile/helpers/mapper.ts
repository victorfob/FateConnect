import { onlyDigits } from '@design-system';
import { parseISO } from 'date-fns';

import {
  formatBirthDate,
  parseBirthDate,
  toApiBirthDate,
} from '@app/pages/Signup/helpers/birthDate';
import type { ProfileInput } from '@app/services/users/profileTypes';
import type { User } from '@app/services/users/types';
import { hasContact } from '@app/utils/contact';
import { maskPhone } from '@app/utils/masks/phoneMask';

import type { ProfileFormInput, ProfileFormValues } from '../schema';

/** O schema já garantiu a data; o vazio só existe para o tipo fechar. */
function toApiBirthDateOrEmpty(value: string): string {
  const parsed = parseBirthDate(value);
  if (!parsed) return '';

  return toApiBirthDate(parsed);
}

export function toProfileFormValues(profile: User): ProfileFormInput {
  return {
    fullName: profile.fullName,
    birthDate: formatBirthDate(parseISO(profile.birthDate)),
    gender: profile.gender,
    phone: maskPhone(profile.phone ?? ''),
    contactEmail: profile.contactEmail ?? '',
    contactIsRequired: hasContact(profile),
    neighborhood: profile.neighborhood ?? '',
    photo: null,
    removeStoredPhoto: false,
    currentPassword: '',
    newPassword: '',
  };
}

export function toProfileInput(values: ProfileFormValues): ProfileInput {
  return {
    fullName: values.fullName,
    birthDate: toApiBirthDateOrEmpty(values.birthDate),
    gender: values.gender,
    phone: onlyDigits(values.phone),
    contactEmail: values.contactEmail,
    neighborhood: values.neighborhood,
    image: values.photo,
  };
}
