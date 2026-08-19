import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';

import { styled } from '../../styled';
import type { PolymorphicProps } from '../../styled';
import { spacing } from '../../theme/helpers/spacing';
import { radius } from '../../theme/helpers/radius';
import { mobileMedia, radiusScale, spacingScale } from '../../tokens';

const { xs, xl } = spacingScale;

const ACTION_MIN_WIDTH_PX = 120;
const ACTION_MIN_WIDTH_MOBILE_PX = 100;
const CONTENT_MAX_WIDTH_PX = 400;
const ACTION_LETTER_SPACING = '0.4px';

export const DialogRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing(xl),
  textAlign: 'center',
});

export const Content = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing(xl),
  maxWidth: `${CONTENT_MAX_WIDTH_PX}px`,
});

export const Actions = styled(DialogActions)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing(xs),

  '& .MuiButton-root': {
    minWidth: `${ACTION_MIN_WIDTH_PX}px`,
    borderRadius: radius(radiusScale.component),
    letterSpacing: ACTION_LETTER_SPACING,
  },

  [mobileMedia]: {
    '& .MuiButton-root': { minWidth: `${ACTION_MIN_WIDTH_MOBILE_PX}px` },
  },
});
