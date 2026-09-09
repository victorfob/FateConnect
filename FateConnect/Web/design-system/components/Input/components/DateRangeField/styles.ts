import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { none, sm } = spacingScale;

/** O calendário abaixo traz o próprio recuo; a dica precisa do dela. */
export const PickerStepHint = styled(Typography)(({ theme }) => ({
  padding: theme.space(sm, sm, none),
  color: theme.palette.text.secondary,
}));
