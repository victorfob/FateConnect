import {
  Box,
  iconSizeTokens,
  mobileMedia,
  PolymorphicBox,
  PolymorphicStack,
  radius,
  radiusScale,
  shadowTokens,
  Stack,
  styled,
} from '@design-system';

const CARD_MIN_WIDTH_PX = 500;
const ICON_DISC_SIZE_PX = 70;

export const ServicesSection = styled(PolymorphicBox)({
  padding: '5vh 7vw 7vh',
});

export const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'block',
  textAlign: 'center',
  marginBottom: '2rem',
  color: theme.palette.text.primary,
}));

export const CardsGrid = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '2rem',
});

export const ServiceCardRoot = styled(PolymorphicStack)(({ theme }) => ({
  flex: 0.5,
  flexDirection: 'column',
  minWidth: `${CARD_MIN_WIDTH_PX}px`,
  alignItems: 'center',
  gap: '1rem',
  padding: '2rem',
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,

  [mobileMedia]: { minWidth: '100%' },
}));

export const IconContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: `${ICON_DISC_SIZE_PX}px`,
  height: `${ICON_DISC_SIZE_PX}px`,
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary.main,

  '& svg': {
    fontSize: `${iconSizeTokens.lg}px`,
    color: theme.palette.common.white,
  },
}));

export const CardTitle = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const CardBody = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
