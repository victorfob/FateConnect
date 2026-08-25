import { Box, styled } from '@design-system';

/** Metade da linha no desktop: 3 de 6 colunas. */
export const HalfWidthCell = styled(Box)(({ theme }) => ({
  width: '100%',

  [theme.breakpoints.up('md')]: { gridColumn: 'span 3' },
}));
