import type { LinkProps } from 'react-router';

import {
  iconSizeTokens,
  mobileMedia,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
} from '@design-system';
import type { PolymorphicProps } from '@design-system';

const { md, xl } = spacingScale;

/** Recuo da tela em unidade de viewport, como no produto. */
const PAGE_PADDING = '7vw';
const CARD_MIN_WIDTH_PX = 300;
const ICON_DISC_SIZE_PX = 70;
/** O cartão cresce um pouco sob o cursor — mesma proporção e curva do produto. */
const CARD_HOVER_SCALE = 1.05;
const CARD_TRANSITION = 'transform 0.3s ease';

type CardProps = PolymorphicProps<Pick<LinkProps, 'to'>>;

export const MenuRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: spacing(md),
  padding: PAGE_PADDING,
});

/** O texto de apoio é mais apagado que o título. */
export const MenuIntro = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const CardsContainer = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  gap: spacing(xl),

  [mobileMedia]: { flexDirection: 'column' },
});

export const ServiceCard = styled(Stack)<CardProps>(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: spacing(md),
  padding: spacing(xl),
  minWidth: `${CARD_MIN_WIDTH_PX}px`,
  height: 'auto',
  borderRadius: radius(radiusScale.lg),
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: CARD_TRANSITION,

  '&:hover': { transform: `scale(${CARD_HOVER_SCALE})` },
}));

export const IconDisc = styled(Stack)<PolymorphicProps>(({ theme }) => ({
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
