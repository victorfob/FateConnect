import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { none, sm, md } = spacingScale;

/** As ações do período, no pé do popover — o toque fora é alvo estreito no celular. */
export const PickerFooter = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: theme.space(sm),
  padding: theme.space(none, md, md),
}));
