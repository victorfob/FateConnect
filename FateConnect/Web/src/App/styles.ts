import { styled } from '@mui/material/styles';

import { spacingScale } from '@ds';

const { md, lg } = spacingScale;

export const PageContainer = styled('main')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(md),
  padding: theme.spacing(lg),
}));
