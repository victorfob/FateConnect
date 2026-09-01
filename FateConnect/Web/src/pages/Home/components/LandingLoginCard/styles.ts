import type { FormHTMLAttributes } from 'react';
import {
  Box,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
  spacingScale,
  styled,
} from '@design-system';

const { xxs, xs, md, lg } = spacingScale;

const CARD_WIDTH_PX = 360;
const SUBMIT_HEIGHT_PX = 40;

export const CardRoot = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(md),
  padding: theme.space(lg),
  // Largura de verdade, e não `flex-basis`: a âncora entre o cartão e a faixa se
  // mede pelo conteúdo, e a base de 360px chegava ao cartão como 300px.
  width: `${CARD_WIDTH_PX}px`,
  maxWidth: '100%',
  background: theme.palette.background.paper,
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,
}));

export const CardTitle = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const Form = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(md),

  '& svg': { color: theme.palette.text.secondary },
}));

export const SubmitRow = styled(Box)(({ theme }) => ({
  marginTop: theme.space(xs),

  '& .MuiButton-root': {
    width: '100%',
    height: `${SUBMIT_HEIGHT_PX}px`,
    borderRadius: theme.radius(radiusScale.component),
  },
}));

export const SignupRow = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: theme.space(xxs),
  justifyContent: 'center',
  textAlign: 'center',
  color: theme.palette.text.secondary,

  '& a': {
    // Sem `inline-flex` a âncora impõe a entrelinha do corpo (24px) e a linha
    // fica mais alta que a do produto, que segue a altura do próprio texto.
    display: 'inline-flex',
    color: theme.palette.brandText,
    textDecoration: 'none',
  },
  '& a:hover': {
    textDecoration: 'underline',
    textDecorationColor: theme.palette.brandText,
  },
}));
