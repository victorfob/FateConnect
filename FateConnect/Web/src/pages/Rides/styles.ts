import {
  Box,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
  Typography,
} from '@design-system';
import type { PolymorphicProps } from '@design-system';
import type { NavLinkProps } from 'react-router';

type NavProps = PolymorphicProps<Pick<NavLinkProps, 'to' | 'end'>>;

const { xxs, xs, md } = spacingScale;

/** Recuo da página em unidades de viewport, como no produto. */
const PAGE_PADDING = '3vw 7vw';
/** 10px na vertical — sem token equivalente entre 8px e 12px. */
const BACK_BUTTON_VERTICAL_PADDING_PX = 10;
const BACK_BUTTON_PADDING = spacing(BACK_BUTTON_VERTICAL_PADDING_PX, md);
const TAB_PADDING = spacing(md, xxs);
const TAB_GAP = '3px';

export const RidesRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  gap: spacing(md),
  padding: PAGE_PADDING,
});

export const RidesHeader = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const BackButton = styled(Stack)<NavProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xs),
  padding: BACK_BUTTON_PADDING,
  borderRadius: radius(radiusScale.component),
  overflow: 'hidden',
  textDecoration: 'none',
  color: theme.palette.primary.contrastText,
  background: theme.palette.primary.main,
  boxShadow: shadowTokens.component,
}));

export const TabList = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  width: '100%',
  borderRadius: radius(radiusScale.component),
  marginTop: spacing(md),
  background: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
}));

export const Tab = styled(Box)<NavProps>(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: TAB_GAP,
  textDecoration: 'none',
  color: theme.palette.text.primary,
  padding: TAB_PADDING,

  '&:first-of-type': {
    borderTopLeftRadius: radius(radiusScale.component),
    borderBottomLeftRadius: radius(radiusScale.component),
  },
  '&:last-of-type': {
    borderTopRightRadius: radius(radiusScale.component),
    borderBottomRightRadius: radius(radiusScale.component),
  },

  '&[aria-current="page"]': {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));
