import { onlyDigits } from '@design-system';

import type { UserUpdateInput } from '@app/services/users/managementTypes';
import type { User } from '@app/services/users/types';
import { hasContact } from '@app/utils/contact';
import { maskPhone } from '@app/utils/masks/phoneMask';

import type { UserFormValues } from '../schema';

/** Campo vazio vai nulo: no corpo JSON a API recusaria o e-mail vazio. */
function blankToNull(value: string): string | null {
  if (value === '') return null;

  return value;
}

export function toFormValues(user: User): UserFormValues {
  return {
    fullName: user.fullName,
    fatecEmail: user.fatecEmail,
    phone: maskPhone(user.phone ?? ''),
    contactEmail: user.contactEmail ?? '',
    contactIsRequired: hasContact(user),
    profileType: user.profileType,
  };
}

export function toUserUpdateInput(values: UserFormValues): UserUpdateInput {
  return {
    fullName: values.fullName,
    fatecEmail: values.fatecEmail,
    phone: blankToNull(onlyDigits(values.phone)),
    contactEmail: blankToNull(values.contactEmail),
  };
}
