import { Box, styled } from '@design-system';

/**
 * O campo do design system é sempre de largura cheia, e aqui ele atravessaria o
 * cartão inteiro para oferecer duas opções. O teto é o que o rótulo mais longo
 * pede, e no estreito ele volta a ocupar a linha.
 */
const FIELD_MAX_WIDTH_PX = 260;

export const StatusField = styled(Box)(({ theme }) => ({
  maxWidth: `${FIELD_MAX_WIDTH_PX}px`,
  width: '100%',

  [theme.breakpoints.down('md')]: { maxWidth: 'none' },
}));
