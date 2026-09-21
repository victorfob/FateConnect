import { useMemo } from 'react';

import { NOTIFICATIONS_LINK } from '@app/constants/navigation';
import { useAppLinks } from '@app/hooks/useAppLinks';

import { DrawerSection } from './components/DrawerSection';
import * as C from './constants';

type DrawerNavigationProps = Readonly<{ onNavigate: VoidFunction }>;

export function DrawerNavigation({ onNavigate }: DrawerNavigationProps) {
  const appLinks = useAppLinks();
  const serviceLinks = useMemo(() => [...appLinks, NOTIFICATIONS_LINK], [appLinks]);

  return (
    <>
      <DrawerSection label={C.SERVICES_LABEL} links={serviceLinks} onNavigate={onNavigate} />
      <DrawerSection label={C.ACCOUNT_LABEL} links={C.ACCOUNT_LINKS} onNavigate={onNavigate} />
    </>
  );
}
