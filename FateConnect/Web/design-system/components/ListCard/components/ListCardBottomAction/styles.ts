import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { none, xs, sm, md } = spacingScale;

export const BottomActionSlot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  // A mesma margem que a descrição e a fileira deixam embaixo: sem ela a base do
  // botão desce abaixo da do texto.
  marginBottom: theme.space(sm),
  marginLeft: theme.space(md),

  '& .MuiButton-root': { gap: theme.space(xs) },

  [theme.breakpoints.down('md')]: {
    marginTop: theme.space(sm),
    marginBottom: theme.space(none),
    marginLeft: theme.space(none),
  },
}));
