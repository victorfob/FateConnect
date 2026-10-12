import { Box, spacingScale, styled } from '@design-system';

const { xs } = spacingScale;

export const SubmitRow = styled(Box)(({ theme }) => ({
  marginTop: theme.space(xs),

  '& .MuiButton-root': { width: '100%' },
}));
