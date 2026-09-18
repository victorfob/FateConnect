import { useCallback } from 'react';
import { IconButton } from '@design-system';
import { DownloadIcon, ImageIcon } from '@design-system/icons';

import { useStoredImage } from '@app/hooks/useStoredImage';

import * as S from './styles';

export type StoredPhotoDownload = Readonly<{ label: string; fileName: string }>;

export type StoredPhotoProps = Readonly<{
  url: string | null;
  alt: string;
  /** Dado, a miniatura vira o gatilho: sem botão à parte e sem segunda busca. */
  download?: StoredPhotoDownload;
}>;

export function StoredPhoto({ url, alt, download }: StoredPhotoProps) {
  const source = useStoredImage(url);

  const handleDownload = useCallback(() => {
    if (!source || !download) return;

    const link = document.createElement('a');
    link.href = source;
    link.download = download.fileName;
    link.click();
  }, [source, download]);

  if (source === null)
    return (
      <S.PhotoPlaceholder aria-hidden>
        <ImageIcon />
      </S.PhotoPlaceholder>
    );

  if (!download) return <S.Photo component="img" src={source} alt={alt} />;

  return (
    <S.DownloadTrigger>
      <S.Photo component="img" src={source} alt={alt} />

      <S.DownloadOverlay>
        <IconButton label={download.label} size="small" onClick={handleDownload}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </S.DownloadOverlay>
    </S.DownloadTrigger>
  );
}
