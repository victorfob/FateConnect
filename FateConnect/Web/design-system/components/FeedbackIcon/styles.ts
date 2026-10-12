import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import type { FeedbackTone } from '@ds-root/theme/types';
import { iconSizeTokens, radiusScale, spacingScale } from '@ds-root/tokens';

const { sm } = spacingScale;

export const ToneDisc = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: FeedbackTone }>(({ theme, tone }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.space(sm),
  borderRadius: theme.radius(radiusScale.circle),
  backgroundColor: theme.palette.feedback[tone].surface,
  color: theme.palette.feedback[tone].content,
  '& svg': { fontSize: `${iconSizeTokens.lg}px` },
}));
