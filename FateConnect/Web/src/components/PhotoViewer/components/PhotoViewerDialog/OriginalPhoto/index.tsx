import { CircularProgress, Dialog } from '@design-system';

import type { PhotoSource } from '@app/components/PhotoViewer/@types/photoSource';
import { useStoredImage } from '@app/hooks/useStoredImage';

import * as C from './constants';
import * as S from './styles';

export type OriginalPhotoProps = Readonly<{ source: PhotoSource; alt: string }>;

export function OriginalPhoto({ source, alt }: OriginalPhotoProps) {
  const { image, loading } = useStoredImage(source.storedUrl ?? null);

  if (source.localUrl) return <S.OriginalImage component="img" src={source.localUrl} alt={alt} />;

  if (loading)
    return (
      <S.LoadingRegion>
        <CircularProgress aria-label={C.LOADING_LABEL} />
      </S.LoadingRegion>
    );

  if (image === null) return <Dialog.Message>{C.LOAD_FAILED_MESSAGE}</Dialog.Message>;

  return <S.OriginalImage component="img" src={image.objectUrl} alt={alt} />;
}
