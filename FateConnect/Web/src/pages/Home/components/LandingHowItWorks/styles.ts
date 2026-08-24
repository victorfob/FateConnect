import { Box, mobileMedia, radius, radiusScale, shadowTokens, Stack, styled } from '@design-system';
import type { PolymorphicProps } from '@design-system';

export const HowSection = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  alignItems: 'center',
  padding: '3rem 7vw',
});

export const SectionTitle = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  textAlign: 'center',
  marginBottom: '2rem',
  color: theme.palette.text.primary,
}));

export const StepsGrid = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  gap: '2rem',

  [mobileMedia]: { flexDirection: 'column' },
});

export const StepCard = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  position: 'relative',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem 1.5rem 1.75rem',
  background: theme.palette.background.paper,
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  textAlign: 'center',
}));

export const StepBadge = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  position: 'absolute',
  top: '-1.25rem',
  left: '50%',
  transform: 'translateX(-50%)',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1,

  [mobileMedia]: { left: '2rem' },
}));

export const StepBody = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: '0.75rem',
  marginTop: '0.5rem',
});

export const StepTitle = styled(Box)<PolymorphicProps>(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const StepDescription = styled(Box)<PolymorphicProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
