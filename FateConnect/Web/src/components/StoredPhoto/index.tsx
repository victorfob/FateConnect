import { ImageIcon } from '@design-system/icons';

import { PhotoViewer } from '@app/components/PhotoViewer';
import { useStoredImage } from '@app/hooks/useStoredImage';

import * as S from './styles';

export type StoredPhotoViewer = Readonly<{ title: string; originalUrl: string | null }>;

export type StoredPhotoProps = Readonly<{
  /** A miniatura: a tela nunca desenha a foto acima de 96 px. */
  url: string | null;
  alt: string;
  /** Dado, a miniatura vira o gatilho, e a original só é buscada quando o diálogo abre. */
  viewer?: StoredPhotoViewer;
}>;

export function StoredPhoto({ url, alt, viewer }: StoredPhotoProps) {
  const { image } = useStoredImage(url);

  if (image === null)
    return (
      <S.PhotoPlaceholder aria-hidden>
        <ImageIcon />
      </S.PhotoPlaceholder>
    );

  if (!viewer?.originalUrl) return <S.Photo component="img" src={image.objectUrl} alt={alt} />;

  return (
    <PhotoViewer
      title={viewer.title}
      alt={alt}
      source={{ storedUrl: viewer.originalUrl }}
      shape="rounded"
    >
      <S.Photo component="img" src={image.objectUrl} alt={alt} />
    </PhotoViewer>
  );
}
