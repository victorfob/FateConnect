import {
  Box,
  Button,
  compactMedia,
  radius,
  radiusScale,
  spacing,
  spacingScale,
  Stack,
  styled,
  type PolymorphicProps,
} from '@design-system';

const { xxs, xs, sm } = spacingScale;

const PREVIEW_SIZE_PX = 96;

export const PhotoField = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: spacing(xxs),
});

export const PhotoRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing(sm),

  [compactMedia]: { flexDirection: 'column', alignItems: 'flex-start' },
});

export const PhotoPreview = styled('img')({
  width: `${PREVIEW_SIZE_PX}px`,
  height: `${PREVIEW_SIZE_PX}px`,
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: radius(radiusScale.md),
});

export const PhotoActions = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: spacing(xs),
});

export const PhotoActionButton = styled(Button)({
  gap: spacing(xxs),
  borderRadius: radius(radiusScale.component),
});

/** Fora da vista, mas focável e rotulado: quem o aciona é o botão. */
export const HiddenFileInput = styled('input')({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});

export const PhotoHint = styled(Box)<PolymorphicProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const PhotoError = styled(Box)<PolymorphicProps>(({ theme }) => ({
  color: theme.palette.error.main,
}));
