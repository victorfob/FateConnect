import { Input } from '@design-system';
import { Controller, useFormContext } from 'react-hook-form';

import type { RideFormInput, RideFormValues } from '../schema';
import * as C from '../constants';
import * as S from './styles';

export function RideFormFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<RideFormInput, unknown, RideFormValues>();

  return (
    <S.FieldsGrid>
      <Input
        {...register('destination')}
        label={C.RIDE_FORM_LABELS.destination}
        required
        fullWidth
        placeholder={C.RIDE_FORM_PLACEHOLDERS.destination}
        error={errors.destination?.message}
      />

      <Controller
        name="departureDate"
        control={control}
        render={({ field }) => (
          <Input.Date
            name={field.name}
            label={C.RIDE_FORM_LABELS.departureDate}
            required
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={field.disabled}
            error={errors.departureDate?.message}
          />
        )}
      />

      <Input
        {...register('departureTime')}
        type="time"
        label={C.RIDE_FORM_LABELS.departureTime}
        required
        fullWidth
        error={errors.departureTime?.message}
      />

      <Controller
        name="rideType"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.RIDE_FORM_LABELS.rideType}
            options={C.RIDE_TYPE_SELECT_OPTIONS}
            required
            error={errors.rideType?.message}
          />
        )}
      />

      <Controller
        name="seats"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.RIDE_FORM_LABELS.seats}
            options={C.SEAT_OPTIONS}
            required
            error={errors.seats?.message}
          />
        )}
      />

      <S.WideCell>
        <Input
          {...register('description')}
          label={C.RIDE_FORM_LABELS.description}
          fullWidth
          multiline
          rows={C.DESCRIPTION_ROWS}
          placeholder={C.RIDE_FORM_PLACEHOLDERS.description}
          error={errors.description?.message}
        />
      </S.WideCell>
    </S.FieldsGrid>
  );
}
