import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled, type PolymorphicProps } from '@src-ds/styled';
import { radius } from '@src-ds/theme/helpers/radius';
import { spacing } from '@src-ds/theme/helpers/spacing';
import { radiusScale, shadowTokens, spacingScale } from '@src-ds/tokens';

const { md } = spacingScale;

/** Recuo da página em unidades de viewport, como no produto. */
const PAGE_PADDING = '3vw 7vw';

export const PageRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  gap: spacing(md),
  padding: PAGE_PADDING,
});

export const PageHeaderRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const PageTitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const TabBar = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  width: '100%',
  borderRadius: radius(radiusScale.component),
  marginTop: spacing(md),
  background: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
}));
