import type { ReactNode } from 'react';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import * as S from './styles';

type HeaderProps = Readonly<{
  /** Marca à esquerda. A aplicação decide para onde ela navega. */
  logo: ReactNode;
  /** Navegação exibida acima do breakpoint mobile. */
  navigation: ReactNode;
  /** Ações fixas à direita, visíveis em qualquer largura. */
  actions?: ReactNode;
  onMenuClick: VoidFunction;
  menuButtonLabel: string;
}>;

/**
 * Cromo do topo: barra fixa, faixa de navegação responsiva e botão de menu.
 * Recebe conteúdo por slot para não depender de rotas nem de hooks da aplicação.
 */
export function Header({ logo, navigation, actions, onMenuClick, menuButtonLabel }: HeaderProps) {
  return (
    <S.HeaderBar position="fixed">
      <S.HeaderToolbar disableGutters>
        <S.LogoSlot component="span">{logo}</S.LogoSlot>

        <S.DesktopNav component="nav">{navigation}</S.DesktopNav>

        <S.ActionsSlot component="span">
          {actions}

          <S.MenuButtonSlot component="span">
            <IconButton color="inherit" aria-label={menuButtonLabel} onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          </S.MenuButtonSlot>
        </S.ActionsSlot>
      </S.HeaderToolbar>
    </S.HeaderBar>
  );
}
