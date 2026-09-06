import { useCallback, useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router';
import { Button, Footer, Header, NavigationDrawer } from '@design-system';

import { BrandLogo } from '@app/components/BrandLogo';
import { LegalFooterLinks } from '@app/components/LegalFooterLinks';
import * as C from '@app/constants/appContact';
import { APP_LINKS } from '@app/constants/navigation';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';

import * as S from '../shell.styles';
import { AccountMenu } from './components/AccountMenu';
import { DrawerNavigation } from './components/DrawerNavigation';
import { DrawerSignOut } from './components/DrawerSignOut';
import { NotificationsMenu } from './components/NotificationsMenu';

const MENU_BUTTON_LABEL = 'Abrir menu';

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  const handleMenuClick = useCallback(() => setDrawerOpen(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);

  return (
    <S.ShellRoot>
      <Header
        logo={<BrandLogo to={RoutePathEnum.MENU} />}
        actions={
          <>
            <NotificationsMenu />
            <AccountMenu />
          </>
        }
        menuButtonLabel={MENU_BUTTON_LABEL}
        onMenuClick={handleMenuClick}
        navigation={APP_LINKS.map(({ path, label }) => (
          <Button
            key={path}
            color="inherit"
            component={RouterLink}
            to={path}
            aria-current={path === pathname ? 'page' : undefined}
          >
            {label}
          </Button>
        ))}
      />

      <NavigationDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        header={<BrandLogo to={RoutePathEnum.MENU} onClick={handleDrawerClose} />}
        footer={<DrawerSignOut />}
      >
        <DrawerNavigation onNavigate={handleDrawerClose} />
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
