import Typography from '@mui/material/Typography';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled, type CSSObject } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { xs, md, lg } = spacingScale;

function growStyle(grow: boolean): CSSObject {
  if (grow) return { flexGrow: 1 };

  return {};
}

export const CardRoot = styled(PolymorphicStack, {
  shouldForwardProp: (prop) => prop !== 'grow',
})<{ grow: boolean }>(({ theme, grow }) => ({
  ...growStyle(grow),
  flexDirection: 'column',
  gap: theme.space(md),
  padding: theme.space(lg),
  borderRadius: theme.radius(radiusScale.component),
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
}));

export const CardHeading = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(xs),
}));
