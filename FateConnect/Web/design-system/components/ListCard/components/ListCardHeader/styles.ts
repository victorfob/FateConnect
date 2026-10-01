import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm } = spacingScale;

export const HeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.space(sm),
  marginBottom: theme.space(sm),

  // Sem ele o título empurra a etiqueta e as ações para fora do cartão no
  // estreito: é o que deixa a caixa encolher até a quebra herdada do corpo.
  '& > :first-of-type': { minWidth: 0 },
}));
