import { useCallback, useState } from 'react';
import { Link as RouterLink, Outlet } from 'react-router';

import { Footer } from '@app/components/Footer';
import { Header } from '@app/components/Header';
import { LANDING_LINKS } from '@app/components/Header/constants';
import { useLandingAnchor } from '@app/hooks/useLandingAnchor';
import { RoutePath, type LandingSection } from '@app/routes/paths';
import { NavigationDrawer } from '../NavigationDrawer';
import { ShellContent, ShellRoot } from '../shell.styles';
import { DrawerSectionItem } from './DrawerSectionItem';
import { Typography } from '@design-system';

/** Casca das rotas públicas (`/inicio`, `/cadastro`). */
export function GuestLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const goToSection = useLandingAnchor();

  const handleMenuClick = useCallback(() => setDrawerOpen(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);
  const handleSectionSelect = useCallback(
    (section: LandingSection) => {
      setDrawerOpen(false);
      goToSection(section);
    },
    [goToSection],
  );

  return (
    <ShellRoot>
      <Header isLoggedIn={false} onMenuClick={handleMenuClick} />

      <NavigationDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        header={
          <RouterLink to={RoutePath.LANDING} aria-label="FateConnect">
            <Typography variant="logo">FateConnect</Typography>
          </RouterLink>
        }
      >
        {LANDING_LINKS.map(({ section, label }) => (
          <DrawerSectionItem
            key={section}
            section={section}
            label={label}
            onSelect={handleSectionSelect}
          />
        ))}
      </NavigationDrawer>

      <ShellContent>
        <Outlet />
      </ShellContent>

      <Footer />
    </ShellRoot>
  );
}
