import { FormGrid, Input } from '@design-system';
import { useFormContext } from 'react-hook-form';

import { FIELD_LABELS, FIELD_PLACEHOLDERS } from '@app/pages/Signup/constants';
import { MAX_LENGTH, type SignupFormValues } from '@app/pages/Signup/schema';

import { BirthDateField } from '../BirthDateField';

export function AccountSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();

  return (
    <>
      <FormGrid.Wide>
        <Input
          {...register('fullName')}
          label={FIELD_LABELS.fullName}
          required
          fullWidth
          type="text"
          autoComplete="name"
          maxLength={MAX_LENGTH.fullName}
          error={errors.fullName?.message}
        />
      </FormGrid.Wide>

      <BirthDateField />

      <Input
        {...register('fatecEmail')}
        label={FIELD_LABELS.fatecEmail}
        required
        fullWidth
        type="email"
        autoComplete="work email"
        placeholder={FIELD_PLACEHOLDERS.fatecEmail}
        maxLength={MAX_LENGTH.fatecEmail}
        error={errors.fatecEmail?.message}
      />

      <Input.Password
        {...register('password')}
        purpose="new"
        label={FIELD_LABELS.password}
        required
        fullWidth
        error={errors.password?.message}
      />

      <Input.Password
        {...register('passwordConfirmation')}
        purpose="new"
        label={FIELD_LABELS.passwordConfirmation}
        required
        fullWidth
        error={errors.passwordConfirmation?.message}
      />
    </>
  );
}
