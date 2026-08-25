import type { ComponentPropsWithRef, ImgHTMLAttributes } from 'react';
import {
  Box,
  Button,
  compactMedia,
  PolymorphicBox,
  radius,
  radiusScale,
  spacing,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { xxs, xs, sm } = spacingScale;

const PREVIEW_SIZE_PX = 96;
/** No estreito a miniatura encolhe para a foto e os botões caberem na mesma linha. */
const COMPACT_PREVIEW_SIZE_PX = 72;

export const PhotoField = styled(Stack)({
  flexDirection: 'column',
  gap: spacing(xxs),
});

export const PhotoRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacing(sm),
});

export const PhotoPreview = styled(PolymorphicBox)<
  Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
>({
  width: `${PREVIEW_SIZE_PX}px`,
  height: `${PREVIEW_SIZE_PX}px`,

  [compactMedia]: {
    width: `${COMPACT_PREVIEW_SIZE_PX}px`,
    height: `${COMPACT_PREVIEW_SIZE_PX}px`,
  },
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: radius(radiusScale.md),
});

export const PhotoActions = styled(Stack)({
  flexDirection: 'column',
  gap: spacing(xs),
});

export const PhotoActionButton = styled(Button)({
  gap: spacing(xxs),
  borderRadius: radius(radiusScale.component),
});

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
