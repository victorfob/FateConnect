import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { xs, md, lg, giant } = spacingScale;

export const FooterRoot = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.chrome.main,
  color: theme.palette.chrome.contrastText,
  padding: theme.space(lg, giant),
  gap: theme.space(md),
  width: '100%',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.space(lg),
  },
}));

/**
 * No mobile o produto centraliza também as linhas de texto, não só as caixas:
 * o alinhamento fica no contêiner e é herdado, no lugar do `:host-context` que
 * a tipografia usava para alcançar o pai.
 */
export const ContactsContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.space(md),
  width: '100%',

  [theme.breakpoints.down('md')]: { alignItems: 'center', textAlign: 'center' },
}));

export const ContactItem = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xs),
}));

export const FooterDivider = styled(Box)(({ theme }) => ({
  width: '1px',
  height: 'auto',
  backgroundColor: theme.palette.chrome.divider,

  [theme.breakpoints.down('md')]: { width: '100%', height: '1px' },
}));

export const CopyrightContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-end',
  gap: theme.space(md),
  width: '100%',

  [theme.breakpoints.down('md')]: { alignItems: 'center', textAlign: 'center' },
}));
