import { styled, Typography } from '@design-system';

export const SafetyNotice = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));
