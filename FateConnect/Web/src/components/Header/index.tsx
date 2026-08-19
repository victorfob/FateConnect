import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import { useLandingAnchor } from '@app/hooks/useLandingAnchor';
import { RoutePath } from '@app/routes/paths';
import { APP_LINKS, LANDING_LINKS } from './constants';
import { LandingNavButton } from './LandingNavButton';
import { DesktopNav, HeaderBar, HeaderToolbar, LogoLink, MenuButtonSlot } from './styles';

type HeaderProps = {
  /**
   * `true` exibe a navegação da área logada; `false`, a da landing.
   * TODO — ligar ao estado de sessão quando a autenticação real existir (#52).
   */
  isLoggedIn?: boolean;
  onMenuClick: VoidFunction;
};

export function Header({ isLoggedIn = true, onMenuClick }: HeaderProps) {
  const goToSection = useLandingAnchor();
  const logoTarget = isLoggedIn ? RoutePath.MENU : RoutePath.LANDING;

  return (
    <HeaderBar position="fixed">
      <HeaderToolbar disableGutters>
        <LogoLink>
          <RouterLink to={logoTarget} aria-label="FateConnect">
            <Typography variant="logo">FateConnect</Typography>
          </RouterLink>
        </LogoLink>

        <DesktopNav>
          {isLoggedIn &&
            APP_LINKS.map(({ path, label }) => (
              <Button key={path} color="inherit" component={RouterLink} to={path}>
                {label}
              </Button>
            ))}

          {!isLoggedIn &&
            LANDING_LINKS.map(({ section, label, highlighted }) => (
              <LandingNavButton
                key={section}
                section={section}
                label={label}
                highlighted={highlighted}
                onSelect={goToSection}
              />
            ))}
        </DesktopNav>

        <MenuButtonSlot>
          <IconButton color="inherit" aria-label="Abrir menu" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        </MenuButtonSlot>
      </HeaderToolbar>
    </HeaderBar>
  );
}
