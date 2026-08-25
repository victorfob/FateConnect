import type { ComponentPropsWithRef, ImgHTMLAttributes } from 'react';
import {
  Box,
  Button,
  compactMedia,
  PolymorphicBox,
  radiusScale,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { xxs, xs, sm } = spacingScale;

const PREVIEW_SIZE_PX = 96;
/** No estreito a miniatura encolhe para a foto e os botões caberem na mesma linha. */
const COMPACT_PREVIEW_SIZE_PX = 72;

export const PhotoField = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xxs),
}));

export const PhotoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.space(sm),
}));

export const PhotoPreview = styled(PolymorphicBox)<
  Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
>(({ theme }) => ({
  width: `${PREVIEW_SIZE_PX}px`,
  height: `${PREVIEW_SIZE_PX}px`,

  [compactMedia]: {
    width: `${COMPACT_PREVIEW_SIZE_PX}px`,
    height: `${COMPACT_PREVIEW_SIZE_PX}px`,
  },
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: theme.radius(radiusScale.md),
}));

export const PhotoActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xs),
}));

export const PhotoActionButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xxs),
  borderRadius: theme.radius(radiusScale.component),
}));

/** Fora da vista, mas focável e rotulado: quem o aciona é o botão. */
export const HiddenFileInput = styled(PolymorphicBox)<ComponentPropsWithRef<'input'>>({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});

/** No estreito a foto e os botões seguem lado a lado, e o texto desce inteiro. */
export const PhotoHint = styled(Box)(({ theme }) => ({
  flex: 1,
  color: theme.palette.text.secondary,

  [compactMedia]: { flexBasis: '100%' },
}));

export const PhotoError = styled(Box)(({ theme }) => ({
  flex: 1,
  color: theme.palette.error.main,

  [compactMedia]: { flexBasis: '100%' },
}));
