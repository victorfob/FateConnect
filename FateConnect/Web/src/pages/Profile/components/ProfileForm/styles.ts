import type { FormHTMLAttributes } from 'react';
import { PolymorphicStack, spacingScale, Stack, styled } from '@design-system';

import type { ProfileCardArea } from './@types';

const { lg } = spacingScale;

export const ProfileFormRoot = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(
  ({ theme }) => ({
    flexDirection: 'column',
    gap: theme.space(lg),
  }),
);

/**
 * No estreito os dados vêm antes do acesso à conta. No desktop a coluna da
 * direita é a mais larga, e as duas terminam na mesma altura.
 */
export const CardsGrid = styled(Stack)(({ theme }) => ({
  display: 'grid',
  gap: theme.space(lg),
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateAreas: '"photo" "data" "access"',

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
    gridTemplateAreas: '"photo data" "access data"',
  },
}));

export const CardArea = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'area',
})<{ area: ProfileCardArea }>(({ area }) => ({
  flexDirection: 'column',
  gridArea: area,
}));
