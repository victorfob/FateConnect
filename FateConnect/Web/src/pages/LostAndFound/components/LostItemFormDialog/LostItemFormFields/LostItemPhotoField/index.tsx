import { useCallback, useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { HiddenField, Typography } from '@design-system';
import { DeleteIcon, ImageIcon } from '@design-system/icons';
import { useFormContext, useWatch } from 'react-hook-form';

import * as C from '@app/pages/LostAndFound/components/LostItemFormDialog/constants';
import type {
  LostItemFormInput,
  LostItemFormValues,
} from '@app/pages/LostAndFound/components/LostItemFormDialog/schema';
import { useStoredImage } from '@app/pages/LostAndFound/hooks/useStoredImage';

import * as S from './styles';

export type LostItemPhotoFieldProps = Readonly<{ storedImageUrl: string | null }>;

export function LostItemPhotoField({ storedImageUrl }: LostItemPhotoFieldProps) {
  const {
    control,
    setValue,
    formState: { errors, disabled },
  } = useFormContext<LostItemFormInput, unknown, LostItemFormValues>();
  const photo = useWatch({ control, name: 'photo' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chosenPhotoUrl = useMemo(() => {
    if (!photo) return null;

    return URL.createObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    if (!chosenPhotoUrl) return;

    return () => URL.revokeObjectURL(chosenPhotoUrl);
  }, [chosenPhotoUrl]);

  const storedPhotoUrl = useStoredImage(storedImageUrl);

  // A escolha de agora cobre a foto guardada; desfeita, a guardada volta a aparecer.
  const preview = useMemo(() => {
    if (chosenPhotoUrl) return { src: chosenPhotoUrl, alt: C.PHOTO_ACTIONS.previewAlt };
    if (storedPhotoUrl) return { src: storedPhotoUrl, alt: C.PHOTO_ACTIONS.storedAlt };

    return null;
  }, [chosenPhotoUrl, storedPhotoUrl]);

  const handlePick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [chosen] = event.target.files ?? [];
      setValue('photo', chosen ?? null, { shouldValidate: true });
      // Zerar o campo deixa o mesmo arquivo, escolhido de novo, disparar a troca.
      event.target.value = '';
    },
    [setValue],
  );

  const handleRemove = useCallback(
    () => setValue('photo', null, { shouldValidate: true }),
    [setValue],
  );

  const pickLabel = useMemo(() => {
    if (preview) return C.PHOTO_ACTIONS.replace;

    return C.PHOTO_ACTIONS.pick;
  }, [preview]);

  const errorMessage = errors.photo?.message;

  return (
    <S.PhotoField>
      <Typography variant="caption">{C.LOST_ITEM_FORM_LABELS.photo}</Typography>

      <S.PhotoRow>
        {preview && <S.PhotoPreview component="img" src={preview.src} alt={preview.alt} />}

        <S.PhotoActions>
          <S.PhotoActionButton variant="outlined" onClick={handlePick} disabled={disabled}>
            <ImageIcon fontSize="small" />
            <Typography variant="caption" color="inherit">
              {pickLabel}
            </Typography>
          </S.PhotoActionButton>

          {/* Só a escolha de agora se desfaz: a foto guardada a API não apaga, só troca. */}
          {photo && (
            <S.PhotoRemoveButton variant="outlined" onClick={handleRemove} disabled={disabled}>
              <DeleteIcon fontSize="small" />
              <Typography variant="caption" color="inherit">
                {C.PHOTO_ACTIONS.remove}
              </Typography>
            </S.PhotoRemoveButton>
          )}
        </S.PhotoActions>

        {errorMessage && (
          <S.PhotoError>
            <Typography variant="caption" color="inherit">
              {errorMessage}
            </Typography>
          </S.PhotoError>
        )}

        {!errorMessage && (
          <S.PhotoHint>
            <Typography variant="caption" color="inherit">
              {C.PHOTO_HINT}
            </Typography>
          </S.PhotoHint>
        )}
      </S.PhotoRow>

      <HiddenField
        component="input"
        ref={fileInputRef}
        type="file"
        accept={C.PHOTO_ACCEPT_ATTRIBUTE}
        aria-label={C.LOST_ITEM_FORM_LABELS.photo}
        disabled={disabled}
        onChange={handleFileChange}
      />
    </S.PhotoField>
  );
}
