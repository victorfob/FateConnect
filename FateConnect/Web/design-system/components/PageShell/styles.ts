import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { md } = spacingScale;

/** Recuo da página em unidades de viewport, como no produto. */
const PAGE_PADDING = '3vw 7vw';

export const PageRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  gap: theme.space(md),
  padding: PAGE_PADDING,
}));

export const PageHeaderRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const PageTitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const TabBar = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  width: '100%',
  borderRadius: theme.radius(radiusScale.component),
  marginTop: theme.space(md),
  background: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
}));
