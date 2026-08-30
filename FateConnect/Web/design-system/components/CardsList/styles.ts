import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm } = spacingScale;

export const CardsColumn = styled(Stack)({
  flexDirection: 'column',
  width: '100%',
});

export const PaginationRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  paddingTop: theme.space(sm),
}));
