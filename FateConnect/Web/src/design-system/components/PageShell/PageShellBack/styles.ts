import Stack from '@mui/material/Stack';

import { styled } from '@src-ds/styled';
import type { PolymorphicProps } from '@src-ds/styled';
import { radius } from '@src-ds/theme/helpers/radius';
import { spacing } from '@src-ds/theme/helpers/spacing';
import { radiusScale, shadowTokens, spacingScale } from '@src-ds/tokens';

const { xs, md } = spacingScale;

/** 10px na vertical — sem token equivalente entre 8px e 12px. */
const VERTICAL_PADDING_PX = 10;

export const BackAction = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xs),
  padding: spacing(VERTICAL_PADDING_PX, md),
  borderRadius: radius(radiusScale.component),
  overflow: 'hidden',
  textDecoration: 'none',
  color: theme.palette.primary.contrastText,
  background: theme.palette.primary.main,
  boxShadow: shadowTokens.component,
}));
