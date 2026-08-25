import { PolymorphicStack, Stack, styled, tabletMedia } from '@design-system';

export const HomeRoot = styled(Stack)({
  flexDirection: 'column',
  width: '100%',
});

export const DescriptionContainer = styled(PolymorphicStack)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: '7vh 7vw',
  gap: '32px',

  [tabletMedia]: { flexDirection: 'column' },
});

export const LoginAnchor = styled(Stack)({
  flexDirection: 'row',

  [tabletMedia]: { justifyContent: 'center' },
});

export const ServicesContainer = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  background: theme.palette.background.paper,
}));
