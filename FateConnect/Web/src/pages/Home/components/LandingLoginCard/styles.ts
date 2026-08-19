import {
  colorTokens,
  darken,
  radius,
  radiusScale,
  shadowTokens,
  styled,
  tabletMedia,
} from '@design-system';

const CARD_WIDTH_PX = 360;
const SUBMIT_HEIGHT_PX = 40;

/** Mesma proporção que o MUI usa para derivar o estado de hover. */
const HOVER_DARKEN_RATIO = 0.2;

export const CardRoot = styled('article')({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  padding: '1.75rem',
  width: `${CARD_WIDTH_PX}px`,
  background: colorTokens.surfaceWhite,
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,

  [tabletMedia]: {
    justifySelf: 'center',
    maxWidth: '24rem',
  },
});

export const CardTitle = styled('div')({
  color: colorTokens.primary,
  textAlign: 'center',
});

export const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',

  '& svg': { color: colorTokens.textMuted },
});

export const SubmitRow = styled('div')({
  marginTop: '0.5rem',

  '& .MuiButton-root': {
    width: '100%',
    height: `${SUBMIT_HEIGHT_PX}px`,
    borderRadius: radius(radiusScale.component),
    backgroundColor: colorTokens.inheritedWarn,
  },
  '& .MuiButton-root:hover': {
    backgroundColor: darken(colorTokens.inheritedWarn, HOVER_DARKEN_RATIO),
  },
});

export const SignupRow = styled('p')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '0.35rem',
  justifyContent: 'center',
  textAlign: 'center',
  color: colorTokens.textMuted,

  '& a': {
    color: colorTokens.accent,
    textDecoration: 'none',
  },
  '& a:hover': {
    textDecoration: 'underline',
    textDecorationColor: colorTokens.accent,
  },
});
