import { useCallback, useMemo, useRef, type ChangeEvent } from 'react';
import { HiddenField, Typography } from '@design-system';

import { useFilePreviewUrl } from '@app/hooks/useFilePreviewUrl';

import { PhotoActionButtons } from './components/PhotoActionButtons';
import { PHOTO_ACCEPT_ATTRIBUTE, PHOTO_FIELD_TEXTS } from './constants';
import * as S from './styles';

export type PhotoFieldPreview = Readonly<{ src: string; alt: string }>;

export type PhotoFieldProps = Readonly<{
  label: string;
  value: File | null;
  onChange: (photo: File | null) => void;
  /** O que o registro já guarda; a escolha de agora o cobre. */
  storedPreview?: PhotoFieldPreview | null;
  error?: string;
  disabled?: boolean;
}>;

export function PhotoField({
  label,
  value,
  onChange,
  storedPreview = null,
  error,
  disabled = false,
}: PhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chosenPhotoUrl = useFilePreviewUrl(value);

  // A escolha de agora cobre a foto guardada; desfeita, a guardada volta a aparecer.
  const preview = useMemo(() => {
    if (chosenPhotoUrl) return { src: chosenPhotoUrl, alt: PHOTO_FIELD_TEXTS.previewAlt };

    return storedPreview;
  }, [chosenPhotoUrl, storedPreview]);

  const handlePick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [chosen] = event.target.files ?? [];
      onChange(chosen ?? null);
      // Zerar o campo deixa o mesmo arquivo, escolhido de novo, disparar a troca.
      event.target.value = '';
    },
    [onChange],
  );

  const handleRemove = useCallback(() => onChange(null), [onChange]);

  const pickLabel = useMemo(() => {
    if (preview) return PHOTO_FIELD_TEXTS.replace;

    return PHOTO_FIELD_TEXTS.pick;
  }, [preview]);

  return (
    <S.PhotoField>
      <Typography variant="caption">{label}</Typography>

      <S.PhotoRow>
        {preview && <S.PhotoPreview component="img" src={preview.src} alt={preview.alt} />}

        <S.PhotoActions>
          {/* Só a escolha de agora se desfaz: o que já está guardado se troca, não se apaga. */}
          <PhotoActionButtons
            pickLabel={pickLabel}
            onPick={handlePick}
            canRemove={Boolean(value)}
            onRemove={handleRemove}
            disabled={disabled}
          />
        </S.PhotoActions>

        {error && (
          <S.PhotoError>
            <Typography variant="caption" color="inherit">
              {error}
            </Typography>
          </S.PhotoError>
        )}

        {!error && (
          <S.PhotoHint>
            <Typography variant="caption" color="inherit">
              {PHOTO_FIELD_TEXTS.hint}
            </Typography>
          </S.PhotoHint>
        )}
      </S.PhotoRow>

      <HiddenField
        component="input"
        ref={fileInputRef}
        type="file"
        accept={PHOTO_ACCEPT_ATTRIBUTE}
        aria-label={label}
        disabled={disabled}
        onChange={handleFileChange}
      />
    </S.PhotoField>
  );
}
