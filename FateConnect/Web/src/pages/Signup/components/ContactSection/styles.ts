import { Box, desktopMedia, styled, type PolymorphicProps } from '@design-system';

/** Metade da linha no desktop: 3 de 6 colunas. */
export const HalfWidthCell = styled(Box)<PolymorphicProps>({
  width: '100%',

  [desktopMedia]: { gridColumn: 'span 3' },
});
