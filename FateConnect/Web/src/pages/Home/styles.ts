import { Stack, styled, tabletMedia } from '@design-system';
import type { PolymorphicProps } from '@design-system';

export const HomeRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  width: '100%',
});

export const DescriptionContainer = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: '7vh 7vw',
  gap: '32px',

  [tabletMedia]: { flexDirection: 'column' },
});

export const LoginAnchor = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',

  [tabletMedia]: { justifyContent: 'center' },
});

export const ServicesContainer = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  background: theme.palette.background.paper,
}));
