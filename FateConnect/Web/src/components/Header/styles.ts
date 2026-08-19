import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';

import { colorTokens, mobileMedia, shadowTokens, spacing, spacingScale } from '@design-system';

const { xs } = spacingScale;

/** Altura do topo; a casca reserva esse espaço porque o header é fixo. */
export const HEADER_HEIGHT_PX = 64;

/** Tamanho e peso dos botões de navegação, iguais aos do produto. */
const NAV_FONT_SIZE = '1rem';
const NAV_FONT_WEIGHT = 500;
const CTA_FONT_WEIGHT = 400;

export const HeaderBar = styled(AppBar)({
  boxShadow: shadowTokens.component,
});

export const HeaderToolbar = styled(Toolbar)({
  height: `${HEADER_HEIGHT_PX}px`,
  minHeight: `${HEADER_HEIGHT_PX}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 7vw',
  color: colorTokens.textOnAccent,
});

export const DesktopNav = styled('nav')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: `${spacing(xs)} 1.5vw`,

  '& .MuiButton-root': {
    fontSize: NAV_FONT_SIZE,
    fontWeight: NAV_FONT_WEIGHT,
    color: colorTokens.textOnAccent,
  },
  // O destaque não recebe o peso reforçado, como no produto.
  '& .MuiButton-contained': {
    fontWeight: CTA_FONT_WEIGHT,
  },

  [mobileMedia]: {
    display: 'none',
  },
});

export const MenuButtonSlot = styled('span')({
  display: 'none',

  [mobileMedia]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
  },
});

/** Marca: sem sublinhado e herdando a cor da barra, como no produto. */
export const LogoLink = styled('span')({
  '& a': {
    textDecoration: 'none',
    color: colorTokens.textOnAccent,
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
  },
  '& a:hover': {
    opacity: 0.8,
  },
});
