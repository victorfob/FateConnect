import { useCallback, useState, type ReactNode } from 'react';
import { IconButton } from '@design-system';
import { OpenInFullIcon } from '@design-system/icons';

import type { PhotoShape, PhotoSource } from './@types/photoSource';
import { PhotoViewerDialog } from './components/PhotoViewerDialog';
import * as C from './constants';
import * as S from './styles';

export type PhotoViewerProps = Readonly<{
  /** A foto já desenhada na tela, que passa a ser o gatilho. */
  children: ReactNode;
  title: string;
  alt: string;
  source: PhotoSource;
  shape: PhotoShape;
}>;

export function PhotoViewer({ children, title, alt, source, shape }: PhotoViewerProps) {
  const [viewing, setViewing] = useState(false);

  const handleOpen = useCallback(() => setViewing(true), []);
  const handleClose = useCallback(() => setViewing(false), []);

  return (
    <>
      <S.ViewerTrigger data-shape={shape}>
        {children}

        <S.ViewerOverlay>
          <IconButton label={C.VIEW_PHOTO_LABEL} size="small" onClick={handleOpen}>
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </S.ViewerOverlay>
      </S.ViewerTrigger>

      <PhotoViewerDialog
        open={viewing}
        onClose={handleClose}
        title={title}
        source={source}
        alt={alt}
      />
    </>
  );
}
