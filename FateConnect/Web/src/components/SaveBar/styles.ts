import { spacingScale, styled, Typography } from '@design-system';

const { none, xs } = spacingScale;

export const UnsavedNotice = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(xs),
  marginRight: 'auto',
  color: theme.palette.text.secondary,

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    marginRight: theme.space(none),
  },
}));
