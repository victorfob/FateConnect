import {
  colorTokens,
  mobileMedia,
  radius,
  radiusScale,
  shadowTokens,
  styled,
} from '@design-system';

export const HowSection = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '3rem 7vw',
});

export const SectionTitle = styled('div')({
  display: 'flex',
  textAlign: 'center',
  marginBottom: '2rem',
  color: colorTokens.primary,
});

export const StepsGrid = styled('div')({
  display: 'flex',
  gap: '2rem',

  [mobileMedia]: { flexDirection: 'column' },
});

export const StepCard = styled('article')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem 1.5rem 1.75rem',
  background: colorTokens.surfaceWhite,
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  textAlign: 'center',
});

export const StepBadge = styled('span')({
  position: 'absolute',
  top: '-1.25rem',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '50%',
  backgroundColor: colorTokens.accent,
  color: colorTokens.surfaceWhite,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1,

  [mobileMedia]: { left: '2rem' },
});

export const StepBody = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  marginTop: '0.5rem',
});

export const StepTitle = styled('div')({ color: colorTokens.primary });

export const StepDescription = styled('div')({ color: colorTokens.textMuted });
