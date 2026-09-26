import { useCallback } from 'react';
import { IconButton } from '@design-system';
import { DownloadIcon, ImageIcon } from '@design-system/icons';

import { useNotification } from '@app/hooks/useNotification';
import { useStoredImage } from '@app/hooks/useStoredImage';

import { DOWNLOAD_FAILED_MESSAGE } from './constants';
import { downloadStoredImage } from './helpers/downloadStoredImage';
import * as S from './styles';

/** Sem o sufixo: quem o escolhe é o formato que a resposta declara. */
export type StoredPhotoDownload = Readonly<{
  label: string;
  baseName: string;
  originalUrl: string | null;
}>;

export type StoredPhotoProps = Readonly<{
  /** A miniatura: a tela nunca desenha a foto acima de 96 px. */
  url: string | null;
  alt: string;
  /** Dado, a miniatura vira o gatilho, e a original só é buscada no clique. */
  download?: StoredPhotoDownload;
}>;

export function StoredPhoto({ url, alt, download }: StoredPhotoProps) {
  const image = useStoredImage(url);
  const { notifyError } = useNotification();

  const handleDownload = useCallback(() => {
    if (!download?.originalUrl) return;

    void downloadStoredImage(download.originalUrl, download.baseName).catch(() =>
      notifyError(DOWNLOAD_FAILED_MESSAGE),
    );
  }, [download, notifyError]);

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
