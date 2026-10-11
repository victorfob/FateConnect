import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

import { alignedWithTitle } from '../styles';

const { md } = spacingScale;

export const MessageText = styled(Typography)(({ theme }) => alignedWithTitle(theme));

export const FeedbackMessage = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(md),
}));

export const FeedbackText = styled(Typography)({ textAlign: 'center' });
