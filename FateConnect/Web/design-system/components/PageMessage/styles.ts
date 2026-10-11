import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { xs, md, lg, xl } = spacingScale;

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

/** Mais de um botão divide a largura; no estreito, um sob o outro, porque a metade não comporta um rótulo com contador. */
export const Actions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  gap: theme.space(xs),
  width: '100%',

  '& > .MuiButton-root:not(:only-child)': { flex: 1 },

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',

    '& > .MuiButton-root:not(:only-child)': { flex: 'none', alignSelf: 'stretch' },
  },
}));
