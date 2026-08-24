import { Box, desktopMedia, styled, type PolymorphicProps } from '@design-system';

/** Ocupa a linha inteira, em qualquer largura. */
export const FullWidthCell = styled(Box)<PolymorphicProps>({
  gridColumn: '1 / -1',
  width: '100%',
});

/** Um terço da linha no desktop: 2 de 6 colunas. */
export const ThirdWidthCell = styled(Box)<PolymorphicProps>({
  width: '100%',

  [desktopMedia]: { gridColumn: 'span 2' },
});
