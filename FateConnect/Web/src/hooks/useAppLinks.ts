import { useMemo } from 'react';

import { APP_LINKS, MANAGEMENT_LINK, type AppLink } from '@app/constants/navigation';
import { loggedUserIsAdministrator } from '@app/services/auth/loggedUser';

/**
 * A navegação da área logada, com o acesso à gestão só para quem é
 * administrador. Uma fonte só: o topo, a gaveta e o menu leem daqui.
 */
export function useAppLinks(): AppLink[] {
  return useMemo(() => {
    if (loggedUserIsAdministrator()) return [...APP_LINKS, MANAGEMENT_LINK];

    return APP_LINKS;
  }, []);
}
