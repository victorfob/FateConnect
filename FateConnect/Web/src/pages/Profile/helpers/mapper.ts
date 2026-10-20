import { onlyDigits } from '@design-system';

import type { ProfileInput } from '@app/services/users/profileTypes';
import type { User } from '@app/services/users/types';
import { toApiDateText, toDisplayDate } from '@app/utils/apiDate';
import { hasContact } from '@app/utils/contact';
import { maskPhone } from '@app/utils/masks/phoneMask';

import type { ProfileFormInput, ProfileFormValues } from '../schema';

export function toProfileFormValues(profile: User): ProfileFormInput {
  return {
    fullName: profile.fullName,
    birthDate: toDisplayDate(profile.birthDate),
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
    birthDate: toApiDateText(values.birthDate),
    phone: onlyDigits(values.phone),
    contactEmail: values.contactEmail,
    neighborhood: values.neighborhood,
    image: values.photo,
  };
}
