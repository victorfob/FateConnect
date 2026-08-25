import { PolymorphicStack, spacingScale, Stack, styled } from '@design-system';

const { lg, xl, xxxl, giant } = spacingScale;

export const HomeRoot = styled(Stack)({
  flexDirection: 'column',
  width: '100%',
});

export const DescriptionContainer = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: theme.space(xxxl, giant),
  gap: theme.space(xl),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: theme.space(xxxl, lg),
  },
}));

export const LoginAnchor = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',

  [theme.breakpoints.down('md')]: { justifyContent: 'center' },
}));

export const ServicesContainer = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  background: theme.palette.background.paper,
}));
