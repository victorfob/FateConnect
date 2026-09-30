import { FormGrid, Input } from '@design-system';
import { Controller, useFormContext } from 'react-hook-form';

import {
  MAX_NEIGHBORHOOD_LENGTH,
  type ProfileFormInput,
  type ProfileFormValues,
} from '@app/pages/Profile/schema';
import { GENDER_SELECT_OPTIONS } from '@app/pages/Signup/components/AccountSection/constants';
import { BirthDateField } from '@app/pages/Signup/components/BirthDateField';
import { FIELD_LABELS } from '@app/pages/Signup/constants';
import { MAX_LENGTH } from '@app/pages/Signup/schema';

import * as C from './constants';

export type PersonalDataFieldsProps = Readonly<{ fatecEmail: string }>;

export function PersonalDataFields({ fatecEmail }: PersonalDataFieldsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormInput, unknown, ProfileFormValues>();

  return (
    <FormGrid>
      <Input
        {...register('fullName')}
        label={FIELD_LABELS.fullName}
        required
        fullWidth
        autoComplete="name"
        maxLength={MAX_LENGTH.fullName}
        error={errors.fullName?.message}
      />

      <BirthDateField />

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={FIELD_LABELS.gender}
            options={GENDER_SELECT_OPTIONS}
            autoComplete="sex"
            required
            error={errors.gender?.message}
          />
        )}
      />

      <Input
        {...register('neighborhood')}
        label={C.NEIGHBORHOOD_LABEL}
        fullWidth
        autoComplete="address-level3"
        maxLength={MAX_NEIGHBORHOOD_LENGTH}
        error={errors.neighborhood?.message}
      />

      <FormGrid.Wide>
        <Input
          label={FIELD_LABELS.fatecEmail}
          value={fatecEmail}
          fullWidth
          disabled
          hint={C.FATEC_EMAIL_HINT}
        />
      </FormGrid.Wide>
    </FormGrid>
  );
}
