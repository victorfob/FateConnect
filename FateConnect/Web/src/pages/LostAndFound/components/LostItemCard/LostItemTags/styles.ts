import { spacing, spacingScale, Stack, styled, type PolymorphicProps } from '@design-system';

const { xs } = spacingScale;

export const TagRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xs),
});
