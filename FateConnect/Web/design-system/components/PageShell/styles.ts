import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { xs, md, lg, xxl, giant } = spacingScale;

export const PageRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  gap: theme.space(md),
  padding: theme.space(xxl, giant),

  [theme.breakpoints.down('md')]: { padding: theme.space(lg) },
}));

export const PageHeaderRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

/** O título e o que fala sobre a tela andam juntos; o canto continua da ação. */
export const TitleGroup = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xs),
  // O título é quem cede quando a linha aperta: o alvo de toque não encolhe.
  minWidth: 0,
}));

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
