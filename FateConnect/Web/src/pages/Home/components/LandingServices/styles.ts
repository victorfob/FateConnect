import {
  Box,
  iconSizeTokens,
  PolymorphicBox,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { md, xl } = spacingScale;

const CARD_MIN_WIDTH_PX = 500;
const ICON_DISC_SIZE_PX = 70;

export const ServicesSection = styled(PolymorphicBox)({
  padding: '5vh 7vw 7vh',
});

export const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'block',
  textAlign: 'center',
  marginBottom: theme.space(xl),
  color: theme.palette.text.primary,
}));

export const CardsGrid = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: theme.space(xl),
}));

export const ServiceCardRoot = styled(PolymorphicStack)(({ theme }) => ({
  flex: 0.5,
  flexDirection: 'column',
  minWidth: `${CARD_MIN_WIDTH_PX}px`,
  alignItems: 'center',
  gap: theme.space(md),
  padding: theme.space(xl),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,

  [theme.breakpoints.down('md')]: { minWidth: '100%' },
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
