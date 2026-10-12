import { useCallback, useMemo } from 'react';
import { Dialog, Input } from '@design-system';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { PhotoField } from '@app/components/PhotoField';
import { useStoredImage } from '@app/hooks/useStoredImage';

import type { LostItemFormInput, LostItemFormValues } from '../schema';
import * as C from '../constants';

export type LostItemFormFieldsProps = Readonly<{ storedThumbnailUrl: string | null }>;

export function LostItemFormFields({ storedThumbnailUrl }: LostItemFormFieldsProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors, disabled },
  } = useFormContext<LostItemFormInput, unknown, LostItemFormValues>();
  const [photo, removeStoredPhoto] = useWatch({ control, name: ['photo', 'removeStoredPhoto'] });
  const description = useWatch({ control, name: 'description' });
  const today = useMemo(() => new Date(), []);
  const { image: storedPhoto } = useStoredImage(storedThumbnailUrl);

  const storedPreview = useMemo(() => {
    if (!storedPhoto || removeStoredPhoto) return null;

    return { src: storedPhoto.objectUrl, alt: C.STORED_PHOTO_ALT };
  }, [removeStoredPhoto, storedPhoto]);

  // Valida na escolha: o formato e o tamanho se sabem na hora, não no envio.
  const handlePhotoChange = useCallback(
    (chosen: File | null) => setValue('photo', chosen, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );

  // A foto guardada só sai ao salvar.
  const handleRemoveStoredPhoto = useCallback(
    () => setValue('removeStoredPhoto', true, { shouldDirty: true }),
    [setValue],
  );

  return (
    <Dialog.Fields>
      <Input
        {...register('name')}
        label={C.LOST_ITEM_FORM_LABELS.name}
        required
        fullWidth
        placeholder={C.LOST_ITEM_FORM_PLACEHOLDERS.name}
        maxLength={C.LOST_ITEM_LIMITS.maxName}
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
        maxLength={C.LOST_ITEM_LIMITS.maxPlace}
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

      <Dialog.Fields.Wide>
        <Input
          {...register('description')}
          label={C.LOST_ITEM_FORM_LABELS.description}
          fullWidth
          multiline
          rows={C.DESCRIPTION_ROWS}
          placeholder={C.LOST_ITEM_FORM_PLACEHOLDERS.description}
          maxLength={C.LOST_ITEM_LIMITS.maxDescription}
          characterCount={description.length}
          error={errors.description?.message}
        />
      </Dialog.Fields.Wide>

      <Dialog.Fields.Wide>
        <PhotoField
          label={C.LOST_ITEM_FORM_LABELS.photo}
          value={photo}
          onChange={handlePhotoChange}
          disabled={disabled}
          storedPreview={storedPreview}
          onRemoveStored={handleRemoveStoredPhoto}
          error={errors.photo?.message}
        />
      </Dialog.Fields.Wide>
    </Dialog.Fields>
  );
}
