import { useCallback } from 'react';
import { Input, Switch } from '@design-system';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { PhotoField } from '@app/components/PhotoField';

import type { DenunciationFormInput, DenunciationFormValues } from '../schema';
import * as C from '../constants';
import * as S from './styles';

export function DenunciationFormFields() {
  const {
    control,
    register,
    setValue,
    formState: { errors, disabled },
  } = useFormContext<DenunciationFormInput, unknown, DenunciationFormValues>();
  const photo = useWatch({ control, name: 'photo' });
  const isAnonymous = useWatch({ control, name: 'isAnonymous' });
  const description = useWatch({ control, name: 'description' });

  // Valida na escolha: o formato e o tamanho se sabem na hora, não no envio.
  const handlePhotoChange = useCallback(
    (chosen: File | null) => setValue('photo', chosen, { shouldValidate: true }),
    [setValue],
  );

  return (
    <S.FieldsColumn>
      <S.ConfidentialGroup>
        <S.ConfidentialToggle
          control={<Switch {...register('isAnonymous')} disabled={disabled} />}
          label={C.DENUNCIATION_FORM_LABELS.confidential}
          labelPlacement="start"
          slotProps={{ typography: { variant: 'subtitleBold' } }}
        />

        {/* Quem não pediu sigilo não precisa saber o que o sigilo implicaria. */}
        {isAnonymous && (
          <S.ConfidentialHint variant="caption">{C.CONFIDENTIAL_HINT}</S.ConfidentialHint>
        )}
      </S.ConfidentialGroup>

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Input.Select
            {...field}
            label={C.DENUNCIATION_FORM_LABELS.category}
            options={C.DENUNCIATION_CATEGORY_SELECT_OPTIONS}
            required
            error={errors.category?.message}
          />
        )}
      />

      <Input
        {...register('description')}
        label={C.DENUNCIATION_FORM_LABELS.description}
        required
        fullWidth
        multiline
        rows={C.DESCRIPTION_ROWS}
        placeholder={C.DENUNCIATION_FORM_PLACEHOLDERS.description}
        maxLength={C.DENUNCIATION_LIMITS.maxDescription}
        characterCount={description.length}
        error={errors.description?.message}
      />

      <PhotoField
        labels={C.PHOTO_FIELD_LABELS}
        accept={C.PHOTO_ACCEPT_ATTRIBUTE}
        value={photo}
        onChange={handlePhotoChange}
        disabled={disabled}
        error={errors.photo?.message}
      />
    </S.FieldsColumn>
  );
}
