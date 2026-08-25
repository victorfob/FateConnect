import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { md, xl } = spacingScale;

const CONTENT_MAX_WIDTH_REM = 28;

export const PageMessageRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.space(xl),
}));

export const MessageContent = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  maxWidth: `${CONTENT_MAX_WIDTH_REM}rem`,
  alignItems: 'center',
  gap: theme.space(md),
  textAlign: 'center',
}));
