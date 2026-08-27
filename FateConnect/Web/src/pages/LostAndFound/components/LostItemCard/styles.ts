import { Box, spacingScale, styled } from '@design-system';

const { xxs } = spacingScale;

export const CancellationNote = styled(Box)(({ theme }) => ({
  marginTop: theme.space(xxs),
  color: theme.palette.text.secondary,
}));
