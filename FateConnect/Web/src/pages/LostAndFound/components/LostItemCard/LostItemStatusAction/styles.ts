import { spacingScale, Stack, styled } from '@design-system';

const { xs, sm } = spacingScale;

export const ActionRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  marginTop: theme.space(sm),

  '& .MuiButton-root': { gap: theme.space(xs) },
}));
