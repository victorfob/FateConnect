import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';

import { styled } from '../../styled';
import { chromeSurface, onChromeSurface, chromeHover } from '../../theme/chromeSurface';
import Stack from '@mui/material/Stack';
import type { PolymorphicProps } from '../../styled';

/** Largura do menu lateral no produto. */
const DRAWER_WIDTH_PX = 300;

/** Recuos do conteúdo dentro do menu, em `vw`, como no original. */
const DRAWER_VERTICAL_PADDING = '7vw';
const LOGO_INSET = '3vw';

/** Altura e recuo padrão de item de lista do Material, preservados. */
const ITEM_MIN_HEIGHT_PX = 48;
const ITEM_INLINE_PADDING_PX = 16;

export const DrawerRoot = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: `${DRAWER_WIDTH_PX}px`,
    backgroundColor: chromeSurface(theme),
    color: onChromeSurface(theme),
    padding: `${DRAWER_VERTICAL_PADDING} 0`,
    overflowX: 'hidden',
  },
}));

export const DrawerHeader = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'start',
  alignItems: 'center',
  width: '100%',
  paddingLeft: LOGO_INSET,
  marginBottom: LOGO_INSET,

  '& a': {
    textDecoration: 'none',
    color: onChromeSurface(theme),
    cursor: 'pointer',
  },
}));

export const DrawerList = styled(List)(({ theme }) => ({
  paddingLeft: 0,

  '& .MuiListItemButton-root': {
    minHeight: `${ITEM_MIN_HEIGHT_PX}px`,
    paddingLeft: `${ITEM_INLINE_PADDING_PX}px`,
    paddingRight: `${ITEM_INLINE_PADDING_PX}px`,
  },
  '& .MuiListItemButton-root:hover': { backgroundColor: chromeHover(theme) },
  '& .MuiListItemText-primary': {
    color: onChromeSurface(theme),
    fontSize: '1rem',
    fontWeight: 400,
  },
}));
