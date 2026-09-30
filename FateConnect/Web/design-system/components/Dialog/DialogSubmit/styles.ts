import Button from '@mui/material/Button';

import { styled } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { xs } = spacingScale;

export const SubmitButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xs),
  borderRadius: theme.radius(radiusScale.component),
}));
