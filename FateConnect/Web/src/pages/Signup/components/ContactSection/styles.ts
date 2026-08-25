import { Box, desktopMedia, styled } from '@design-system';

/** Metade da linha no desktop: 3 de 6 colunas. */
export const HalfWidthCell = styled(Box)({
  width: '100%',

  [desktopMedia]: { gridColumn: 'span 3' },
});
