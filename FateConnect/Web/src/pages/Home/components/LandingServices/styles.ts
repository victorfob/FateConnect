import {
  colorTokens,
  iconSizeTokens,
  mobileMedia,
  radius,
  radiusScale,
  shadowTokens,
  styled,
} from '@design-system';

const CARD_MIN_WIDTH_PX = 500;
const ICON_DISC_SIZE_PX = 70;

export const ServicesSection = styled('section')({
  padding: '5vh 7vw 7vh',
});

export const SectionTitle = styled('div')({
  display: 'block',
  textAlign: 'center',
  marginBottom: '2rem',
  color: colorTokens.primary,
});

export const CardsGrid = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '2rem',
});

export const ServiceCardRoot = styled('article')({
  display: 'flex',
  flex: 0.5,
  flexDirection: 'column',
  minWidth: `${CARD_MIN_WIDTH_PX}px`,
  alignItems: 'center',
  gap: '1rem',
  padding: '2rem',
  textAlign: 'center',
  backgroundColor: colorTokens.surfaceGray,
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,

  [mobileMedia]: { minWidth: '100%' },
});

export const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: `${ICON_DISC_SIZE_PX}px`,
  height: `${ICON_DISC_SIZE_PX}px`,
  borderRadius: '50%',
  backgroundColor: colorTokens.accent,

  '& svg': {
    fontSize: `${iconSizeTokens.lg}px`,
    color: colorTokens.surfaceWhite,
  },
});

export const CardTitle = styled('div')({ color: colorTokens.primary });

export const CardBody = styled('div')({ color: colorTokens.textMuted });
