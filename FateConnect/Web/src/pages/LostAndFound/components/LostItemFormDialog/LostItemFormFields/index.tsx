import { useCallback, useMemo } from 'react';
import { Input } from '@design-system';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { PhotoField } from '@app/components/PhotoField';
import { useStoredImage } from '@app/hooks/useStoredImage';

import type { LostItemFormInput, LostItemFormValues } from '../schema';
import * as C from '../constants';
import * as S from './styles';

export type LostItemFormFieldsProps = Readonly<{ storedImageUrl: string | null }>;

export function LostItemFormFields({ storedImageUrl }: LostItemFormFieldsProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors, disabled },
  } = useFormContext<LostItemFormInput, unknown, LostItemFormValues>();
  const photo = useWatch({ control, name: 'photo' });
  const today = useMemo(() => new Date(), []);
  const storedPhotoUrl = useStoredImage(storedImageUrl);

  const storedPreview = useMemo(() => {
    if (!storedPhotoUrl) return null;

    return { src: storedPhotoUrl, alt: C.STORED_PHOTO_ALT };
  }, [storedPhotoUrl]);

  // Valida na escolha: o formato e o tamanho se sabem na hora, não no envio.
  const handlePhotoChange = useCallback(
    (chosen: File | null) => setValue('photo', chosen, { shouldValidate: true }),
    [setValue],
  );

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
            value={field.value}
            onChange={field.onChange}
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
        <PhotoField
          labels={C.PHOTO_FIELD_LABELS}
          accept={C.PHOTO_ACCEPT_ATTRIBUTE}
          value={photo}
          onChange={handlePhotoChange}
          disabled={disabled}
          storedPreview={storedPreview}
          error={errors.photo?.message}
        />
      </S.WideCell>
    </S.FieldsGrid>
  );
}
