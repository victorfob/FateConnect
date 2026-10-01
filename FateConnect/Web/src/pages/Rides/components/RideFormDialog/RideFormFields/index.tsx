import { useCallback, useEffect, useMemo } from 'react';
import { Dialog, Input } from '@design-system';
import { toZonedTime } from 'date-fns-tz';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { RIDE_TYPE_HELP } from '@app/pages/Rides/helpers/rideType';
import { RideFrequencyEnum } from '@app/services/rides/types';

import { isRuledOutDeparture, repeatUntilRange } from '../helpers/recurrenceDays';
import type { RideFormInput, RideFormValues } from '../schema';
import * as C from '../constants';

type RideFormFieldsProps = Readonly<{ holidays: ReadonlySet<string> }>;

export function RideFormFields({ holidays }: RideFormFieldsProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<RideFormInput, unknown, RideFormValues>();
  const description = useWatch({ control, name: 'description' });
  const frequency = useWatch({ control, name: 'frequency' });
  const departure = useWatch({ control, name: 'departure' });
  // No fuso do produto, e não no de quem preenche: a leste daqui o dia já virou,
  // e o calendário desabilitaria uma partida que a API ainda aceita.
  const today = useMemo(() => toZonedTime(new Date(), C.PRODUCT_TIME_ZONE), []);
  const repeatUntilLimits = useMemo(() => repeatUntilRange(departure), [departure]);
  const hasRecurrence = frequency !== RideFrequencyEnum.ONCE;

  const isDepartureRuledOut = useCallback(
    (day: Date) => isRuledOutDeparture(day, frequency, holidays),
    [frequency, holidays],
  );

  // Voltar para uma vez só descarta a data final: o campo some e nada fica guardado.
  useEffect(() => {
    if (!hasRecurrence) setValue('repeatUntil', '');
  }, [hasRecurrence, setValue]);

  return (
    <Dialog.Fields>
      <Dialog.Fields.Wide>
        <Input
          {...register('destination')}
          label={C.RIDE_FORM_LABELS.destination}
          required
          fullWidth
          placeholder={C.RIDE_FORM_PLACEHOLDERS.destination}
          maxLength={C.RIDE_LIMITS.maxDestination}
          error={errors.destination?.message}
        />
      </Dialog.Fields.Wide>

      <Controller
        name="rideType"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.RIDE_FORM_LABELS.rideType}
            helpText={RIDE_TYPE_HELP}
            options={C.RIDE_TYPE_SELECT_OPTIONS}
            required
            error={errors.rideType?.message}
          />
        )}
      />

      <Controller
        name="vehicleType"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.RIDE_FORM_LABELS.vehicleType}
            options={C.VEHICLE_TYPE_SELECT_OPTIONS}
            required
            error={errors.vehicleType?.message}
          />
        )}
      />

      <Controller
        name="frequency"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.RIDE_FORM_LABELS.frequency}
            options={C.RIDE_FREQUENCY_SELECT_OPTIONS}
            required
            error={errors.frequency?.message}
          />
        )}
      />

      <Controller
        name="departure"
        control={control}
        render={({ field }) => (
          <Input.DateTime
            name={field.name}
            label={
              hasRecurrence ? C.RIDE_FORM_LABELS.recurrenceStart : C.RIDE_FORM_LABELS.departure
            }
            required
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={field.disabled}
            minDate={today}
            shouldDisableDate={isDepartureRuledOut}
            error={errors.departure?.message}
          />
        )}
      />

      {hasRecurrence && (
        <Dialog.Fields.Wide>
          <Controller
            name="repeatUntil"
            control={control}
            render={({ field }) => (
              <Input.Date
                name={field.name}
                label={C.RIDE_FORM_LABELS.repeatUntil}
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={field.disabled}
                minDate={repeatUntilLimits.minDate}
                maxDate={repeatUntilLimits.maxDate}
                error={errors.repeatUntil?.message}
              />
            )}
          />
        </Dialog.Fields.Wide>
      )}

      <Dialog.Fields.Wide>
        <Input
          {...register('description')}
          label={C.RIDE_FORM_LABELS.description}
          fullWidth
          multiline
          rows={C.DESCRIPTION_ROWS}
          placeholder={C.RIDE_FORM_PLACEHOLDERS.description}
          maxLength={C.RIDE_LIMITS.maxDescription}
          characterCount={description.length}
          error={errors.description?.message}
        />
      </Dialog.Fields.Wide>
    </Dialog.Fields>
  );
}
