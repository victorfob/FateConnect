import { DrawerSection } from './components/DrawerSection';
import * as C from './constants';

type DrawerNavigationProps = Readonly<{ onNavigate: VoidFunction }>;

export function DrawerNavigation({ onNavigate }: DrawerNavigationProps) {
  return (
    <>
      <DrawerSection label={C.SERVICES_LABEL} links={C.SERVICE_LINKS} onNavigate={onNavigate} />
      <DrawerSection label={C.ACCOUNT_LABEL} links={C.ACCOUNT_LINKS} onNavigate={onNavigate} />
    </>
  );
}
