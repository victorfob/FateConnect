import { Input } from '@design-system';
import { useFormContext } from 'react-hook-form';

import type { ProfileFormInput, ProfileFormValues } from '@app/pages/Profile/schema';

import * as C from './constants';
import * as S from './styles';

export type PasswordFieldsProps = Readonly<{ fatecEmail: string }>;

export function PasswordFields({ fatecEmail }: PasswordFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormInput, unknown, ProfileFormValues>();

  return (
    <>
      <S.AccountUsername
        component="input"
        type="email"
        autoComplete="username"
        value={fatecEmail}
        readOnly
      />

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
