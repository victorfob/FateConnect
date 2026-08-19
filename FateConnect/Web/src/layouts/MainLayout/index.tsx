import { useCallback, useState } from 'react';
import { Link as RouterLink, Outlet } from 'react-router';

import { APP_CONTACT, FOOTER_COPYRIGHT_LINES, FOOTER_TITLE } from '@app/constants/appContact';
import { APP_LINKS } from '@app/constants/navigation';
import { LandingSection, RoutePath } from '@app/routes/paths';
import {
  Button,
  Footer,
  Header,
  ListItemButton,
  ListItemText,
  NavigationDrawer,
  Typography,
} from '@design-system';
import * as S from '../shell.styles';

const MENU_BUTTON_LABEL = 'Abrir menu';

/** Casca das rotas internas (`/menu`, `/caronas`, …). */
export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuClick = useCallback(() => setDrawerOpen(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);

  const logo = (
    <RouterLink to={RoutePath.MENU} aria-label="FateConnect">
      <Typography variant="logo" color="inherit">
        FateConnect
      </Typography>
    </RouterLink>
  );

  return (
    <S.ShellRoot>
      <Header
        logo={logo}
        menuButtonLabel={MENU_BUTTON_LABEL}
        onMenuClick={handleMenuClick}
        navigation={APP_LINKS.map(({ path, label }) => (
          <Button key={path} color="inherit" component={RouterLink} to={path}>
            {label}
          </Button>
        ))}
      />

      <NavigationDrawer open={drawerOpen} onClose={handleDrawerClose} header={logo}>
        {APP_LINKS.map(({ path, label }) => (
          <ListItemButton key={path} component={RouterLink} to={path} onClick={handleDrawerClose}>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </NavigationDrawer>

      <S.ShellContent>
        <Outlet />
      </S.ShellContent>

      <Footer
        anchorId={LandingSection.CONTACT}
        title={FOOTER_TITLE}
        contact={APP_CONTACT}
        copyrightLines={FOOTER_COPYRIGHT_LINES}
      />
    </S.ShellRoot>
  );
}
