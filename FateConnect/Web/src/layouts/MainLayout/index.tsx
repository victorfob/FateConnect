import { useCallback, useState } from 'react';
import { Link as RouterLink, Outlet } from 'react-router';

import { Footer } from '@app/components/Footer';
import { Header } from '@app/components/Header';
import { APP_LINKS } from '@app/components/Header/constants';
import { RoutePath } from '@app/routes/paths';
import { NavigationDrawer } from '../NavigationDrawer';
import { ShellContent, ShellRoot } from '../shell.styles';
import { ListItemButton, ListItemText, Typography } from '@design-system';

/** Casca das rotas internas (`/menu`, `/caronas`, …). */
export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuClick = useCallback(() => setDrawerOpen(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);

  return (
    <ShellRoot>
      <Header onMenuClick={handleMenuClick} />

      <NavigationDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        header={
          <RouterLink to={RoutePath.MENU} aria-label="FateConnect">
            <Typography variant="logo">FateConnect</Typography>
          </RouterLink>
        }
      >
        {APP_LINKS.map(({ path, label }) => (
          <ListItemButton key={path} component={RouterLink} to={path} onClick={handleDrawerClose}>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </NavigationDrawer>

      <ShellContent>
        <Outlet />
      </ShellContent>

      <Footer />
    </ShellRoot>
  );
}
