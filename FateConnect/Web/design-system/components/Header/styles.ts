import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import { PolymorphicBox, PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { shadowTokens, spacingScale } from '@ds-root/tokens';

const { none, xs, lg, giant } = spacingScale;

/** Altura do topo; a casca reserva esse espaço porque o header é fixo. */
export const HEADER_HEIGHT_PX = 64;

const NAV_FONT_SIZE = '1rem';
const NAV_FONT_WEIGHT = 500;
const CTA_FONT_WEIGHT = 400;

const MENU_BUTTON_WIDTH = '48px';

export const HeaderBar = styled(AppBar)({
  boxShadow: shadowTokens.component,
});

export const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  height: `${HEADER_HEIGHT_PX}px`,
  minHeight: `${HEADER_HEIGHT_PX}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.space(none, giant),
  color: theme.palette.chrome.contrastText,

  [theme.breakpoints.down('md')]: { padding: theme.space(none, lg) },
}));

export const LogoSlot = styled(PolymorphicBox)(({ theme }) => ({
  '& a': {
    textDecoration: 'none',
    color: theme.palette.chrome.contrastText,
    cursor: 'pointer',
    transition: theme.transitions.create('opacity'),
  },
  '& a:hover': { opacity: 0.8 },
}));

export const DesktopNav = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.space(xs, lg),
  // Empurra navegação e ações para a direita, mantendo só a marca à esquerda.
  // Sem isso, o `space-between` distribui os três blocos e centraliza a navegação.
  marginLeft: 'auto',

  '& .MuiButton-root': {
    fontSize: NAV_FONT_SIZE,
    fontWeight: NAV_FONT_WEIGHT,
    color: theme.palette.chrome.contrastText,
  },
  // O destaque não recebe o peso reforçado, como no produto.
  '& .MuiButton-contained': { fontWeight: CTA_FONT_WEIGHT },

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const ActionsSlot = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  // Separa uma ação da outra. Com um filho só isso não aparecia, e duas
  // ações adjacentes ficavam encostadas.
  gap: theme.space(xs),
  marginLeft: theme.space(lg),
}));

/**
 * Só existe abaixo do breakpoint mobile. O `display: flex` na consulta é o que
 * volta a exibir o botão: sem ele o `display: none` da base vale em toda
 * largura e o ícone de menu nunca aparece.
 */
export const MenuButtonSlot = styled(PolymorphicStack)(({ theme }) => ({
  display: 'none',

  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: MENU_BUTTON_WIDTH,
  },
}));
