import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { fromFormDate, toFormDate } from '@app/utils/apiDate';
import { Input } from '@design-system';

import type { LostItemFormInput, LostItemFormValues } from '../schema';
import * as C from '../constants';
import { LostItemPhotoField } from './LostItemPhotoField';
import * as S from './styles';

/** Os seis campos do item: duas colunas, descrição e foto na linha inteira. */
export function LostItemFormFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LostItemFormInput, unknown, LostItemFormValues>();
  // Item achado ou perdido só pode ter ocorrido até hoje.
  const today = useMemo(() => new Date(), []);

  return (
    <S.FieldsGrid>
      <Input
        {...register('name')}
        label={C.LOST_ITEM_FORM_LABELS.name}
        required
        fullWidth
        placeholder={C.LOST_ITEM_FORM_PLACEHOLDERS.name}
        error={errors.name?.message}
      />

      <Controller
        name="kind"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.LOST_ITEM_FORM_LABELS.kind}
            options={C.LOST_ITEM_KIND_SELECT_OPTIONS}
            required
            error={errors.kind?.message}
          />
        )}
      />

      <Input
        {...register('place')}
        label={C.LOST_ITEM_FORM_LABELS.place}
        required
        fullWidth
        placeholder={C.LOST_ITEM_FORM_PLACEHOLDERS.place}
        error={errors.place?.message}
      />

      <Controller
        name="occurredOn"
        control={control}
        render={({ field }) => (
          <Input.Date
            name={field.name}
            label={C.LOST_ITEM_FORM_LABELS.occurredOn}
            required
            value={fromFormDate(field.value)}
            onChange={(date) => field.onChange(toFormDate(date))}
            onBlur={field.onBlur}
            disabled={field.disabled}
            maxDate={today}
            error={errors.occurredOn?.message}
          />
        )}
      />

      <S.WideCell>
        <Input
          {...register('description')}
          label={C.LOST_ITEM_FORM_LABELS.description}
          fullWidth
          multiline
          rows={C.DESCRIPTION_ROWS}
          placeholder={C.LOST_ITEM_FORM_PLACEHOLDERS.description}
          error={errors.description?.message}
        />
      </S.WideCell>

      <S.WideCell>
        <LostItemPhotoField />
      </S.WideCell>
    </S.FieldsGrid>
  );
}
