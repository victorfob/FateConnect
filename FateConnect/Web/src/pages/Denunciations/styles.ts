import {
  Button,
  radiusScale,
  shadowTokens,
  spacingScale,
  Stack,
  styled,
  Typography,
} from '@design-system';

const { xs, sm, md, lg } = spacingScale;

export const IntroCard = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.space(md),
  padding: theme.space(lg),
  borderRadius: theme.radius(radiusScale.component),
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
}));

export const IntroText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const StartButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xs),
  marginTop: theme.space(sm),
  borderRadius: theme.radius(radiusScale.component),

  // No estreito o cartão é a largura da tela, e o botão acompanha.
  [theme.breakpoints.down('md')]: { alignSelf: 'stretch' },
}));
