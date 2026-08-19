import { colorTokens, styled, tabletMedia } from '@design-system';

export const HomeRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const DescriptionContainer = styled('section')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: '7vh 7vw',
  gap: '32px',

  [tabletMedia]: { flexDirection: 'column' },
});

export const LoginAnchor = styled('div')({
  display: 'flex',

  [tabletMedia]: { justifyContent: 'center' },
});

export const ServicesContainer = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: colorTokens.surfaceWhite,
});
