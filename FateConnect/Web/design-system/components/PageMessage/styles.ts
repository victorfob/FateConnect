import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { md, lg, xl } = spacingScale;

const CONTENT_MAX_WIDTH_REM = 28;

export const PageMessageRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.space(xl),
}));

export const MessageCard = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  width: '100%',
  maxWidth: `${CONTENT_MAX_WIDTH_REM}rem`,
  alignItems: 'center',
  gap: theme.space(md),
  padding: theme.space(lg),
  textAlign: 'center',
  borderRadius: theme.radius(radiusScale.component),
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
}));
