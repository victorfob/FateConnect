import { Input } from '@design-system';
import { useFormContext } from 'react-hook-form';

import { AccountUsername } from '@app/components/AccountUsername';
import type { ProfileFormInput, ProfileFormValues } from '@app/pages/Profile/schema';

import * as C from './constants';

export type PasswordFieldsProps = Readonly<{ fatecEmail: string }>;

export function PasswordFields({ fatecEmail }: PasswordFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormInput, unknown, ProfileFormValues>();

  return (
    <>
      <AccountUsername email={fatecEmail} />

      <Input.Password
        {...register('currentPassword')}
        purpose="reauthentication"
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
