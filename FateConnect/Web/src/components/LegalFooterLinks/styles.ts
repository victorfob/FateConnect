import { spacingScale, Stack, styled } from '@design-system';

const { xs, md } = spacingScale;

export const LinksRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.space(md),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.space(xs),
  },
}));
