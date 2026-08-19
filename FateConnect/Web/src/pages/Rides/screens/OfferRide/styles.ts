import {
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
} from '@design-system';
import type { PolymorphicProps } from '@design-system';
import type { ButtonHTMLAttributes } from 'react';

const { xxs, md, lg, xxl } = spacingScale;

/** 3rem no topo e no rodapé, 1rem nas laterais, como no produto. */
const CARD_PADDING = spacing(xxl, md);
/** 1.5rem entre título, texto e botão. */
const CARD_GAP = spacing(lg);
const BUTTON_MIN_WIDTH_PX = 200;
const BUTTON_HOVER_BRIGHTNESS = 0.95;

export const OfferWrapper = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  marginTop: spacing(md),
  width: '100%',
});

export const OfferCard = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  background: theme.palette.background.paper,
  borderRadius: radius(radiusScale.component),
  padding: CARD_PADDING,
  textAlign: 'center',
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
  gap: CARD_GAP,
}));

export const OfferButton = styled(Stack)<PolymorphicProps<ButtonHTMLAttributes<HTMLButtonElement>>>(
  ({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(xxs),
    padding: spacing(md),
    minWidth: `${BUTTON_MIN_WIDTH_PX}px`,
    border: 0,
    borderRadius: radius(radiusScale.component),
    color: theme.palette.secondary.contrastText,
    background: theme.palette.secondary.main,
    boxShadow: shadowTokens.component,
    cursor: 'pointer',

    '&:hover': { filter: `brightness(${BUTTON_HOVER_BRIGHTNESS})` },
  }),
);
