import { Box, styled } from '@design-system';

/** Ocupa a linha inteira, em qualquer largura. */
export const FullWidthCell = styled(Box)({
  gridColumn: '1 / -1',
  width: '100%',
});

/** Metade da linha no desktop: 3 de 6 colunas. */
export const HalfWidthCell = styled(Box)(({ theme }) => ({
  width: '100%',

  [theme.breakpoints.up('md')]: { gridColumn: 'span 3' },
}));
