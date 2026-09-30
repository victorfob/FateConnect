import { useCallback, useMemo, useRef, type ChangeEvent } from 'react';
import { HiddenField, InitialsAvatar, SectionCard, Typography } from '@design-system';
import { useFormContext, useWatch } from 'react-hook-form';

import { PhotoActionButtons } from '@app/components/PhotoField/components/PhotoActionButtons';
import { PHOTO_ACCEPT_ATTRIBUTE, PHOTO_FIELD_TEXTS } from '@app/components/PhotoField/constants';
import { useFilePreviewUrl } from '@app/hooks/useFilePreviewUrl';
import { useStoredImage } from '@app/hooks/useStoredImage';
import type { ProfileFormInput, ProfileFormValues } from '@app/pages/Profile/schema';
import { getInitials } from '@app/utils/initials';

import { PHOTO_LABEL } from './constants';
import * as S from './styles';

export type PhotoCardProps = Readonly<{ storedPhotoUrl: string | null }>;

const DIRTY_AND_VALIDATED = { shouldDirty: true, shouldValidate: true };

export function PhotoCard({ storedPhotoUrl }: PhotoCardProps) {
  const {
    control,
    setValue,
    formState: { errors, disabled },
  } = useFormContext<ProfileFormInput, unknown, ProfileFormValues>();
  const [photo, removeStoredPhoto, fullName] = useWatch({
    control,
    name: ['photo', 'removeStoredPhoto', 'fullName'],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storedPhoto = useStoredImage(storedPhotoUrl);
  const initials = useMemo(() => getInitials(fullName), [fullName]);

  const chosenPhotoUrl = useFilePreviewUrl(photo);

  const shownPhotoUrl = useMemo(() => {
    if (chosenPhotoUrl) return chosenPhotoUrl;
    if (removeStoredPhoto) return undefined;

    return storedPhoto?.objectUrl;
  }, [chosenPhotoUrl, removeStoredPhoto, storedPhoto]);

  const pickLabel = useMemo(() => {
    if (shownPhotoUrl) return PHOTO_FIELD_TEXTS.replace;

    return PHOTO_FIELD_TEXTS.pick;
  }, [shownPhotoUrl]);

  const handlePick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [chosen] = event.target.files ?? [];
      if (chosen) setValue('photo', chosen, DIRTY_AND_VALIDATED);
      // Zerar o campo deixa o mesmo arquivo, escolhido de novo, disparar a troca.
      event.target.value = '';
    },
    [setValue],
  );

  // Tira a escolha de agora e também a foto guardada, que sai de vez ao salvar.
  const handleRemove = useCallback(() => {
    setValue('photo', null, DIRTY_AND_VALIDATED);
    if (storedPhotoUrl) setValue('removeStoredPhoto', true, { shouldDirty: true });
  }, [setValue, storedPhotoUrl]);

  return (
    <SectionCard grow>
      <S.PhotoCardContent>
        <InitialsAvatar
          initials={initials}
          label={fullName}
          size="portrait"
          photoSrc={shownPhotoUrl}
        />
        <Typography variant="subtitleBold">{fullName}</Typography>

        <S.PhotoActions>
          <PhotoActionButtons
            pickLabel={pickLabel}
            onPick={handlePick}
            canRemove={Boolean(shownPhotoUrl)}
            onRemove={handleRemove}
            disabled={disabled}
          />
        </S.PhotoActions>

        {errors.photo && <S.PhotoError variant="caption">{errors.photo.message}</S.PhotoError>}
        {!errors.photo && <S.PhotoHint variant="caption">{PHOTO_FIELD_TEXTS.hint}</S.PhotoHint>}
      </S.PhotoCardContent>

      <HiddenField
        component="input"
        ref={fileInputRef}
        type="file"
        accept={PHOTO_ACCEPT_ATTRIBUTE}
        aria-label={PHOTO_LABEL}
        disabled={disabled}
        onChange={handleFileChange}
      />
    </SectionCard>
  );
}
