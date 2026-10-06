import { styled, Typography } from '@design-system';

export const NoteText = styled(Typography)<{ component?: 'p' }>(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
