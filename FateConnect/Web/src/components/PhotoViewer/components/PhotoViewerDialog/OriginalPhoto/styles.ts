import type { ImgHTMLAttributes } from 'react';
import { PolymorphicBox, spacingScale, Stack, styled } from '@design-system';

const { xl } = spacingScale;

export const LoadingRegion = styled(Stack)(({ theme }) => ({
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingBlock: theme.space(xl),
}));

/** Encolhe com o miolo e mantém a proporção: a foto inteira cabe sem rolar. */
export const OriginalImage = styled(PolymorphicBox)<
  Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
>({
  display: 'block',
  width: '100%',
  minHeight: 0,
  objectFit: 'contain',
});
