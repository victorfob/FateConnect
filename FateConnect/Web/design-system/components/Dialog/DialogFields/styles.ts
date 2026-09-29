import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm, md } = spacingScale;

/**
 * O rótulo do campo preenchido sobe acima da borda, e o miolo rola: sem este
 * respiro a primeira linha sairia cortada.
 */
const LABEL_CLEARANCE = sm;

export const GridRegion = styled(Box)(({ theme }) => ({
  paddingTop: theme.space(LABEL_CLEARANCE),
}));

export const ColumnRegion = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(md),
  paddingTop: theme.space(LABEL_CLEARANCE),
}));
