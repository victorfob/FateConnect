import Stack from '@mui/material/Stack';

import { styled, type PolymorphicProps } from '@ds-root/styled';
import { radius } from '@ds-root/theme/helpers/radius';
import { spacing } from '@ds-root/theme/helpers/spacing';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

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
