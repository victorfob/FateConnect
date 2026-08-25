import {
  Box,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { xs, sm, lg, xl, xxl, giant } = spacingScale;

const BADGE_SIZE = '2.5rem';

export const HowSection = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.space(xxl, giant),

  [theme.breakpoints.down('md')]: { padding: theme.space(xxl, lg) },
}));

export const SectionTitle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  textAlign: 'center',
  marginBottom: theme.space(xl),
  color: theme.palette.text.primary,
}));

export const StepsGrid = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.space(xl),

  [theme.breakpoints.down('md')]: { flexDirection: 'column' },
}));

export const StepCard = styled(PolymorphicStack)(({ theme }) => ({
  position: 'relative',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.space(xl, lg, lg),
  background: theme.palette.background.paper,
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  textAlign: 'center',
}));

export const StepBadge = styled(PolymorphicStack)(({ theme }) => ({
  position: 'absolute',
  // Metade da própria altura: é o que faz o círculo montar sobre a borda do
  // cartão. Não é token de espaçamento — muda junto com `BADGE_SIZE`.
  top: `calc(${BADGE_SIZE} / -2)`,
  left: '50%',
  transform: 'translateX(-50%)',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: BADGE_SIZE,
  height: BADGE_SIZE,
  borderRadius: theme.radius(radiusScale.circle),
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  ...theme.typography.subtitleBold,

  [theme.breakpoints.down('md')]: { left: theme.space(xl) },
}));

export const StepBody = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(sm),
  marginTop: theme.space(xs),
}));

export const StepTitle = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const StepDescription = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
