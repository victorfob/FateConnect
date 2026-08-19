import { useCallback, useState } from 'react';
import { Link as RouterLink, Outlet } from 'react-router';

import { DrawerSectionItem } from '@app/components/DrawerSectionItem';
import { LandingNavButton } from '@app/components/LandingNavButton';
import { APP_CONTACT, FOOTER_COPYRIGHT_LINES, FOOTER_TITLE } from '@app/constants/appContact';
import { LANDING_LINKS } from '@app/constants/navigation';
import { useLandingAnchor } from '@app/hooks/useLandingAnchor';
import { LandingSection, RoutePath } from '@app/routes/paths';
import { Footer, Header, NavigationDrawer, Typography } from '@design-system';
import { ShellContent, ShellRoot } from '../shell.styles';

const MENU_BUTTON_LABEL = 'Abrir menu';

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

  const logo = (
    <RouterLink to={RoutePath.LANDING} aria-label="FateConnect">
      <Typography variant="logo" color="inherit">
        FateConnect
      </Typography>
    </RouterLink>
  );

  return (
    <ShellRoot>
      <Header
        logo={logo}
        menuButtonLabel={MENU_BUTTON_LABEL}
        onMenuClick={handleMenuClick}
        navigation={LANDING_LINKS.map(({ section, label, highlighted }) => (
          <LandingNavButton
            key={section}
            section={section}
            label={label}
            highlighted={highlighted}
            onSelect={goToSection}
          />
        ))}
      />

      <NavigationDrawer open={drawerOpen} onClose={handleDrawerClose} header={logo}>
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

      <Footer
        anchorId={LandingSection.CONTACT}
        title={FOOTER_TITLE}
        contact={APP_CONTACT}
        copyrightLines={FOOTER_COPYRIGHT_LINES}
      />
    </ShellRoot>
  );
}
