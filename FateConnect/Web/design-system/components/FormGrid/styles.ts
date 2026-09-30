import Box from '@mui/material/Box';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { md } = spacingScale;

export const GridRoot = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.space(md),
  // Sem isto o campo ao lado de um que exibe erro estica até a altura dele.
  alignItems: 'start',

  [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
}));

export const WideCell = styled(Box)({ gridColumn: '1 / -1' });
