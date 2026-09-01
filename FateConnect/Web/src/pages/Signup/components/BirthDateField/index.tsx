import { Input } from '@design-system';
import { Controller, useFormContext } from 'react-hook-form';

import { FIELD_LABELS } from '@app/pages/Signup/constants';
import { EARLIEST_BIRTH_DATE, latestBirthDate } from '@app/pages/Signup/helpers/birthDate';
import type { SignupFormValues } from '@app/pages/Signup/schema';

export function BirthDateField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SignupFormValues>();

  return (
    <Controller
      name="birthDate"
      control={control}
      render={({ field }) => (
        <Input.Date
          name={field.name}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          label={FIELD_LABELS.birthDate}
          required
          error={errors.birthDate?.message}
          minDate={EARLIEST_BIRTH_DATE}
          maxDate={latestBirthDate()}
        />
      )}
    />
  );
}
