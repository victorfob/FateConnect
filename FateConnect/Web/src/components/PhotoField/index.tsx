import { useCallback, useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { HiddenField, Typography } from '@design-system';
import { DeleteIcon, ImageIcon } from '@design-system/icons';

import * as S from './styles';

export type PhotoFieldLabels = Readonly<{
  field: string;
  hint: string;
  pick: string;
  replace: string;
  remove: string;
  previewAlt: string;
}>;

export type PhotoFieldPreview = Readonly<{ src: string; alt: string }>;

export type PhotoFieldProps = Readonly<{
  labels: PhotoFieldLabels;
  /** Filtra o seletor do sistema; quem valida o formato é o schema de quem usa. */
  accept: string;
  value: File | null;
  onChange: (photo: File | null) => void;
  /** O que o registro já guarda; a escolha de agora o cobre. */
  storedPreview?: PhotoFieldPreview | null;
  error?: string;
  disabled?: boolean;
}>;

export function PhotoField({
  labels,
  accept,
  value,
  onChange,
  storedPreview = null,
  error,
  disabled = false,
}: PhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chosenPhotoUrl = useMemo(() => {
    if (!value) return null;

    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    if (!chosenPhotoUrl) return;

    return () => URL.revokeObjectURL(chosenPhotoUrl);
  }, [chosenPhotoUrl]);

  // A escolha de agora cobre a foto guardada; desfeita, a guardada volta a aparecer.
  const preview = useMemo(() => {
    if (chosenPhotoUrl) return { src: chosenPhotoUrl, alt: labels.previewAlt };

    return storedPreview;
  }, [chosenPhotoUrl, labels.previewAlt, storedPreview]);

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
    if (preview) return labels.replace;

    return labels.pick;
  }, [preview, labels.pick, labels.replace]);

  return (
    <S.PhotoField>
      <Typography variant="caption">{labels.field}</Typography>

      <S.PhotoRow>
        {preview && <S.PhotoPreview component="img" src={preview.src} alt={preview.alt} />}

        <S.PhotoActions>
          <S.PhotoActionButton variant="outlined" onClick={handlePick} disabled={disabled}>
            <ImageIcon fontSize="small" />
            <Typography variant="caption" color="inherit">
              {pickLabel}
            </Typography>
          </S.PhotoActionButton>

          {/* Só a escolha de agora se desfaz: o que já está guardado se troca, não se apaga. */}
          {value && (
            <S.PhotoRemoveButton variant="outlined" onClick={handleRemove} disabled={disabled}>
              <DeleteIcon fontSize="small" />
              <Typography variant="caption" color="inherit">
                {labels.remove}
              </Typography>
            </S.PhotoRemoveButton>
          )}
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
              {labels.hint}
            </Typography>
          </S.PhotoHint>
        )}
      </S.PhotoRow>

      <HiddenField
        component="input"
        ref={fileInputRef}
        type="file"
        accept={accept}
        aria-label={labels.field}
        disabled={disabled}
        onChange={handleFileChange}
      />
    </S.PhotoField>
  );
}
