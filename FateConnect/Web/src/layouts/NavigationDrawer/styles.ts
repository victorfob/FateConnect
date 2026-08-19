import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { styled } from '@mui/material/styles';

import { colorTokens } from '@ds';

/** Largura do menu lateral no produto. */
const DRAWER_WIDTH_PX = 300;

/** Recuo do conteúdo dentro do menu, em `vw`, como no original. */
const DRAWER_VERTICAL_PADDING = '7vw';
const LOGO_INSET = '3vw';

/** Altura e recuo padrão de item de lista do Material, preservados. */
const ITEM_MIN_HEIGHT_PX = 48;
const ITEM_INLINE_PADDING_PX = 16;

export const DrawerRoot = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: `${DRAWER_WIDTH_PX}px`,
    backgroundColor: colorTokens.primary,
    color: colorTokens.textOnAccent,
    padding: `${DRAWER_VERTICAL_PADDING} 0`,
    overflowX: 'hidden',
  },
});

export const DrawerHeader = styled('div')({
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  width: '100%',
  paddingLeft: LOGO_INSET,
  marginBottom: LOGO_INSET,

  '& a': {
    textDecoration: 'none',
    color: colorTokens.textOnAccent,
    cursor: 'pointer',
  },
});

export const DrawerList = styled(List)({
  paddingLeft: 0,

  '& .MuiListItemButton-root': {
    minHeight: `${ITEM_MIN_HEIGHT_PX}px`,
    paddingLeft: `${ITEM_INLINE_PADDING_PX}px`,
    paddingRight: `${ITEM_INLINE_PADDING_PX}px`,
  },
  '& .MuiListItemButton-root:hover': {
    backgroundColor: colorTokens.surfaceHover,
  },
  '& .MuiListItemText-primary': {
    color: colorTokens.textOnAccent,
    fontSize: '1rem',
    fontWeight: 400,
  },
});
