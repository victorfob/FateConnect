import { FormGrid, Input } from '@design-system';
import { Controller, useFormContext } from 'react-hook-form';

import { NEIGHBORHOOD_SUGGESTIONS } from '@app/constants/neighborhoods';
import {
  MAX_NEIGHBORHOOD_LENGTH,
  type ProfileFormInput,
  type ProfileFormValues,
} from '@app/pages/Profile/schema';
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
      <FormGrid.Wide>
        <Input
          {...register('fullName')}
          label={FIELD_LABELS.fullName}
          required
          fullWidth
          autoComplete="name"
          maxLength={MAX_LENGTH.fullName}
          error={errors.fullName?.message}
        />
      </FormGrid.Wide>

      <BirthDateField />

      <Controller
        name="neighborhood"
        control={control}
        render={({ field }) => (
          <Input.Autocomplete
            {...field}
            addressLike
            label={C.NEIGHBORHOOD_LABEL}
            helpText={C.NEIGHBORHOOD_HELP}
            options={NEIGHBORHOOD_SUGGESTIONS}
            maxLength={MAX_NEIGHBORHOOD_LENGTH}
            error={errors.neighborhood?.message}
          />
        )}
      />

      <FormGrid.Wide>
        <Input
          label={FIELD_LABELS.fatecEmail}
          helpText={C.FATEC_EMAIL_HELP}
          value={fatecEmail}
          fullWidth
          disabled
        />
      </FormGrid.Wide>
    </FormGrid>
  );
}
