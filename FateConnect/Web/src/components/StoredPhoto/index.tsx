import { useCallback } from 'react';
import { IconButton } from '@design-system';
import { DownloadIcon, ImageIcon } from '@design-system/icons';

import { useStoredImage } from '@app/hooks/useStoredImage';

import { downloadFileName } from './helpers/downloadFileName';
import * as S from './styles';

/** Sem o sufixo: quem o escolhe é o formato que a resposta declara. */
export type StoredPhotoDownload = Readonly<{ label: string; baseName: string }>;

export type StoredPhotoProps = Readonly<{
  url: string | null;
  alt: string;
  /** Dado, a miniatura vira o gatilho: sem botão à parte e sem segunda busca. */
  download?: StoredPhotoDownload;
}>;

export function StoredPhoto({ url, alt, download }: StoredPhotoProps) {
  const image = useStoredImage(url);

  const handleDownload = useCallback(() => {
    if (!image || !download) return;

    const link = document.createElement('a');
    link.href = image.objectUrl;
    link.download = downloadFileName(download.baseName, image.contentType);
    link.click();
  }, [image, download]);

  if (image === null)
    return (
      <S.PhotoPlaceholder aria-hidden>
        <ImageIcon />
      </S.PhotoPlaceholder>
    );

  if (!download) return <S.Photo component="img" src={image.objectUrl} alt={alt} />;

  return (
    <S.DownloadTrigger>
      <S.Photo component="img" src={image.objectUrl} alt={alt} />

      <S.DownloadOverlay>
        <IconButton label={download.label} size="small" onClick={handleDownload}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </S.DownloadOverlay>
    </S.DownloadTrigger>
  );
}
