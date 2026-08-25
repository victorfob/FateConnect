import { spacing, spacingScale, Stack, styled } from '@design-system';

const { xs, sm } = spacingScale;

export const ActionRow = styled(Stack)({
  flexDirection: 'row',
  marginTop: spacing(sm),

  '& .MuiButton-root': { gap: spacing(xs) },
});
