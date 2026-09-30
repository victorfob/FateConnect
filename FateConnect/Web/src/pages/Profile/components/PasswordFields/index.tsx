import { Input } from '@design-system';
import { useFormContext } from 'react-hook-form';

import type { ProfileFormInput, ProfileFormValues } from '@app/pages/Profile/schema';

import * as C from './constants';

export function PasswordFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormInput, unknown, ProfileFormValues>();

  return (
    <>
      <Input.Password
        {...register('currentPassword')}
        purpose="current"
        label={C.PASSWORD_LABELS.current}
        fullWidth
        error={errors.currentPassword?.message}
      />

      <Input.Password
        {...register('newPassword')}
        purpose="new"
        label={C.PASSWORD_LABELS.new}
        fullWidth
        error={errors.newPassword?.message}
      />
    </>
  );
}
