import { useMemo } from 'react';
import { Input } from '@design-system';
import { toZonedTime } from 'date-fns-tz';
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
  // No fuso do produto, e não no de quem preenche: a leste daqui o dia já virou,
  // e o calendário desabilitaria uma partida que a API ainda aceita.
  const today = useMemo(() => toZonedTime(new Date(), C.PRODUCT_TIME_ZONE), []);

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
        name="departure"
        control={control}
        render={({ field }) => (
          <Input.DateTime
            name={field.name}
            label={C.RIDE_FORM_LABELS.departure}
            required
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={field.disabled}
            minDate={today}
            error={errors.departure?.message}
          />
        )}
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
