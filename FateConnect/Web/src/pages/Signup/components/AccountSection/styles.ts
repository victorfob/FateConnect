import { Box, styled } from '@design-system';

/** Ocupa a linha inteira, em qualquer largura. */
export const FullWidthCell = styled(Box)({
  gridColumn: '1 / -1',
  width: '100%',
});

/** Um terço da linha no desktop: 2 de 6 colunas. */
export const ThirdWidthCell = styled(Box)(({ theme }) => ({
  width: '100%',

  [theme.breakpoints.up('md')]: { gridColumn: 'span 2' },
}));
