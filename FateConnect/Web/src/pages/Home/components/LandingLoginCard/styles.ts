import type { FormHTMLAttributes } from 'react';
import {
  Box,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
  styled,
  tabletMedia,
} from '@design-system';

const CARD_WIDTH_PX = 360;
const SUBMIT_HEIGHT_PX = 40;

export const CardRoot = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  gap: '1.25rem',
  padding: '1.75rem',
  width: `${CARD_WIDTH_PX}px`,
  background: theme.palette.background.paper,
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,

  [tabletMedia]: {
    justifySelf: 'center',
    maxWidth: '24rem',
  },
}));

export const CardTitle = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const Form = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(({ theme }) => ({
  flexDirection: 'column',
  gap: '1rem',

  '& svg': { color: theme.palette.text.secondary },
}));

export const SubmitRow = styled(Box)(({ theme }) => ({
  marginTop: '0.5rem',

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
  gap: '0.35rem',
  justifyContent: 'center',
  textAlign: 'center',
  color: theme.palette.text.secondary,

  '& a': {
    // Sem `inline-flex` a âncora impõe a entrelinha do corpo (24px) e a linha
    // fica mais alta que a do produto, que segue a altura do próprio texto.
    display: 'inline-flex',
    color: theme.palette.secondary.main,
    textDecoration: 'none',
  },
  '& a:hover': {
    textDecoration: 'underline',
    textDecorationColor: theme.palette.secondary.main,
  },
}));
