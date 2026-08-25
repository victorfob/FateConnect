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

/** Logradouro ocupa 4 de 6 colunas; o número fica ao lado. */
export const StreetCell = styled(Box)(({ theme }) => ({
  width: '100%',

  [theme.breakpoints.up('md')]: { gridColumn: '1 / span 4' },
}));

export const StreetNumberCell = styled(Box)(({ theme }) => ({
  width: '100%',

  [theme.breakpoints.up('md')]: { gridColumn: '5 / span 2' },
}));
