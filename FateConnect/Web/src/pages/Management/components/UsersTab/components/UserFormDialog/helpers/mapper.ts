import { onlyDigits } from '@design-system';

import type { UserUpdateInput } from '@app/services/users/managementTypes';
import type { User } from '@app/services/users/types';
import { maskPhone } from '@app/utils/masks/phoneMask';

import type { UserFormValues } from '../schema';

export function toFormValues(user: User): UserFormValues {
  return {
    fullName: user.fullName,
    fatecEmail: user.fatecEmail,
    phone: maskPhone(user.phone),
    contactEmail: user.contactEmail,
    profileType: user.profileType,
  };
}

export function toUserUpdateInput(values: UserFormValues): UserUpdateInput {
  return {
    fullName: values.fullName,
    fatecEmail: values.fatecEmail,
    phone: onlyDigits(values.phone),
    contactEmail: values.contactEmail,
  };
}
