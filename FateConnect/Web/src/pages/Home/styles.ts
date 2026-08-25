import { PolymorphicStack, spacingScale, Stack, styled } from '@design-system';

const { xl } = spacingScale;

export const HomeRoot = styled(Stack)({
  flexDirection: 'column',
  width: '100%',
});

export const DescriptionContainer = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: '7vh 7vw',
  gap: theme.space(xl),

  [theme.breakpoints.down('md')]: { flexDirection: 'column' },
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
