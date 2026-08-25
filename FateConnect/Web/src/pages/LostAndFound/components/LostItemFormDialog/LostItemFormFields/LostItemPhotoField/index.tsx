import { useCallback, useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { Typography } from '@design-system';
import { DeleteIcon, ImageIcon } from '@design-system/icons';
import { useFormContext, useWatch } from 'react-hook-form';

import * as C from '@app/pages/LostAndFound/components/LostItemFormDialog/constants';
import type {
  LostItemFormInput,
  LostItemFormValues,
} from '@app/pages/LostAndFound/components/LostItemFormDialog/schema';

import * as S from './styles';

export function LostItemPhotoField() {
  const {
    control,
    setValue,
    formState: { errors, disabled },
  } = useFormContext<LostItemFormInput, unknown, LostItemFormValues>();
  const photo = useWatch({ control, name: 'photo' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!photo) return null;

    return URL.createObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    if (!previewUrl) return;

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

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
    if (photo) return C.PHOTO_ACTIONS.replace;

    return C.PHOTO_ACTIONS.pick;
  }, [photo]);

  const errorMessage = errors.photo?.message;

  return (
    <S.PhotoField>
      <Typography variant="caption">{C.LOST_ITEM_FORM_LABELS.photo}</Typography>

      <S.PhotoRow>
        {previewUrl && <S.PhotoPreview src={previewUrl} alt={C.PHOTO_ACTIONS.previewAlt} />}

        <S.PhotoActions>
          <S.PhotoActionButton variant="outlined" onClick={handlePick} disabled={disabled}>
            <ImageIcon fontSize="small" />
            <Typography variant="caption" color="inherit">
              {pickLabel}
            </Typography>
          </S.PhotoActionButton>

          {photo && (
            <S.PhotoActionButton
              variant="outlined"
              color="error"
              onClick={handleRemove}
              disabled={disabled}
            >
              <DeleteIcon fontSize="small" />
              <Typography variant="caption" color="inherit">
                {C.PHOTO_ACTIONS.remove}
              </Typography>
            </S.PhotoActionButton>
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

      <S.HiddenFileInput
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
