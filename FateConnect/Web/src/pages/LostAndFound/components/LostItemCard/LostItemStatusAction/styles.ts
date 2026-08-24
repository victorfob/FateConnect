import { spacing, spacingScale, Stack, styled, type PolymorphicProps } from '@design-system';

const { xs, sm } = spacingScale;

export const ActionRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  marginTop: spacing(sm),

  '& .MuiButton-root': { gap: spacing(xs) },
});
