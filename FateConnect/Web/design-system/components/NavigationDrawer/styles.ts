import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { chromeHover, chromeSurface, onChromeSurface } from '@ds-root/theme/chromeSurface';
import { spacingScale } from '@ds-root/tokens';

const { none, md } = spacingScale;

/** Largura do menu lateral no produto. */
const DRAWER_WIDTH_PX = 300;

/** Recuos do conteúdo dentro do menu, em `vw`, como no original. */
const DRAWER_VERTICAL_PADDING = '7vw';
const LOGO_INSET = '3vw';

/** Altura e recuo padrão de item de lista do Material, preservados. */
const ITEM_MIN_HEIGHT_PX = 48;

export const DrawerRoot = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: `${DRAWER_WIDTH_PX}px`,
    backgroundColor: chromeSurface(theme),
    color: onChromeSurface(theme),
    padding: `${DRAWER_VERTICAL_PADDING} 0`,
    overflowX: 'hidden',
  },
}));

export const DrawerHeader = styled(Stack)(({ theme }) => ({
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
  paddingLeft: theme.space(none),

  '& .MuiListItemButton-root': {
    minHeight: `${ITEM_MIN_HEIGHT_PX}px`,
    paddingLeft: theme.space(md),
    paddingRight: theme.space(md),
  },
  '& .MuiListItemButton-root:hover': { backgroundColor: chromeHover(theme) },
  '& .MuiListItemText-primary': {
    color: onChromeSurface(theme),
    fontSize: '1rem',
    fontWeight: 400,
  },
}));
