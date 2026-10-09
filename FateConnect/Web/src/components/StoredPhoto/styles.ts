import type { ImgHTMLAttributes } from 'react';
import { iconSizeTokens, PolymorphicBox, radiusScale, Stack, styled } from '@design-system';

const PHOTO_SIZE_PX = 96;

export const Photo = styled(PolymorphicBox)<
  Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
>(({ theme }) => ({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: theme.radius(radiusScale.md),
}));

/** Sem foto o espaço continua ocupado, para o cartão não mudar de altura. */
export const PhotoPlaceholder = styled(Stack)(({ theme }) => ({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radius(radiusScale.md),
  background: theme.palette.background.default,

  '& svg': {
    color: theme.palette.text.secondary,
    fontSize: `${iconSizeTokens.lg}px`,
  },
}));
