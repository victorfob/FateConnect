import { Box, spacingScale, styled } from '@design-system';

const { xxs, sm } = spacingScale;

export const DeletionNote = styled(Box)(({ theme }) => ({
  marginTop: theme.space(xxs),
  marginBottom: theme.space(sm),
  color: theme.palette.text.secondary,
}));
