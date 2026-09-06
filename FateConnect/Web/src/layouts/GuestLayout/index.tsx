import { useCallback, useState } from 'react';
import { Outlet } from 'react-router';
import { Footer, Header, NavigationDrawer } from '@design-system';

import { BrandLogo } from '@app/components/BrandLogo';
import { DrawerSectionItem } from '@app/components/DrawerSectionItem';
import { LandingNavButton } from '@app/components/LandingNavButton';
import { LegalFooterLinks } from '@app/components/LegalFooterLinks';
import * as C from '@app/constants/appContact';
import { LANDING_LINKS } from '@app/constants/navigation';
import { useLandingAnchor } from '@app/hooks/useLandingAnchor';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';

import * as S from '../shell.styles';
import { ThemeToggleButton } from './components/ThemeToggleButton';

const MENU_BUTTON_LABEL = 'Abrir menu';

export function GuestLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const goToSection = useLandingAnchor();

  const handleMenuClick = useCallback(() => setDrawerOpen(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);
  const handleSectionSelect = useCallback(
    (section: LandingSectionEnum) => {
      setDrawerOpen(false);
      goToSection(section);
    },
    [goToSection],
  );

  return (
    <S.ShellRoot>
      <Header
        logo={<BrandLogo to={RoutePathEnum.LANDING} />}
        actions={<ThemeToggleButton />}
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

      <NavigationDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        header={<BrandLogo to={RoutePathEnum.LANDING} onClick={handleDrawerClose} />}
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

      <S.ShellContent component="main">
        <Outlet />
      </S.ShellContent>

      <Footer
        anchorId={LandingSectionEnum.CONTACT}
        title={C.FOOTER_TITLE}
        contact={C.APP_CONTACT}
        copyrightLines={C.FOOTER_COPYRIGHT_LINES}
        links={<LegalFooterLinks />}
      />
    </S.ShellRoot>
  );
}
