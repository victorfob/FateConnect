import type { LinkProps } from 'react-router';
import {
  iconSizeTokens,
  mobileMedia,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { md, xl } = spacingScale;

/** Recuo da tela em unidade de viewport, como no produto. */
const PAGE_PADDING = '7vw';
const CARD_MIN_WIDTH_PX = 300;
const ICON_DISC_SIZE_PX = 70;
/** O cartão cresce um pouco sob o cursor — mesma proporção e curva do produto. */
const CARD_HOVER_SCALE = 1.05;
const CARD_TRANSITION = 'transform 0.3s ease';

type CardProps = Pick<LinkProps, 'to'>;

export const MenuRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: theme.space(md),
  padding: PAGE_PADDING,
}));

/** O texto de apoio é mais apagado que o título. */
export const MenuIntro = styled(Stack)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const CardsContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.space(xl),

  [mobileMedia]: { flexDirection: 'column' },
}));

export const ServiceCard = styled(PolymorphicStack)<CardProps>(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(md),
  padding: theme.space(xl),
  minWidth: `${CARD_MIN_WIDTH_PX}px`,
  height: 'auto',
  borderRadius: theme.radius(radiusScale.lg),
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: CARD_TRANSITION,

  '&:hover': { transform: `scale(${CARD_HOVER_SCALE})` },
}));

export const IconDisc = styled(PolymorphicStack)(({ theme }) => ({
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
