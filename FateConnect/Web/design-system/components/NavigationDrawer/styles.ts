import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { none, xs, sm, md, lg } = spacingScale;

const DRAWER_WIDTH_PX = 300;

/** Altura e recuo padrão de item de lista do Material, preservados. */
const ITEM_MIN_HEIGHT_PX = 48;

const CURRENT_MARK_THICKNESS_PX = 3;

export const DrawerRoot = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: `${DRAWER_WIDTH_PX}px`,
    backgroundColor: theme.palette.chrome.main,
    color: theme.palette.chrome.contrastText,
    padding: theme.space(lg, none),
    overflowX: 'hidden',

    // O item de lista se estiliza aqui, no papel, e não na lista: o rodapé
    // também recebe itens, e descer estes seletores para a `DrawerList` os
    // deixaria de fora — sem erro, só sem estilo.
    '& .MuiListItemButton-root': {
      position: 'relative',
      minHeight: `${ITEM_MIN_HEIGHT_PX}px`,
      paddingLeft: theme.space(md),
      paddingRight: theme.space(md),
    },
    '& .MuiListItemButton-root:hover': { backgroundColor: theme.palette.chrome.hover },
    '& .MuiListItemButton-root[aria-current="page"]::before': {
      content: '""',
      position: 'absolute',
      left: theme.space(none),
      top: theme.space(none),
      bottom: theme.space(none),
      width: `${CURRENT_MARK_THICKNESS_PX}px`,
      backgroundColor: 'currentColor',
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.chrome.contrastText,
      ...theme.typography.body,
    },
  },
}));

export const DrawerHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'start',
  alignItems: 'center',
  width: '100%',
  paddingLeft: theme.space(sm),
  marginBottom: theme.space(sm),

  '& a': {
    textDecoration: 'none',
    color: theme.palette.chrome.contrastText,
    cursor: 'pointer',
  },
}));

export const DrawerList = styled(List)(({ theme }) => ({
  paddingLeft: theme.space(none),
}));

/**
 * O `marginTop` automático cola a zona no fim da gaveta porque o papel do
 * `Drawer` já é uma coluna flex de altura inteira. A borda é a do cromo, e não
 * `palette.divider`, que desaparece sobre a cor de marca.
 */
export const DrawerFooter = styled(Stack)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.space(xs),
  borderTop: `1px solid ${theme.palette.chrome.divider}`,
}));
