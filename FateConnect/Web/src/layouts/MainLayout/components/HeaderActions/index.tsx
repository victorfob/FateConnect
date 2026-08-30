import { useMemo } from 'react';
import { InitialsAvatar, ThemeToggleButton } from '@design-system';

import { loggedUserName } from '@app/services/auth/loggedUser';
import { getInitials } from '@app/utils/initials';

/**
 * Ações fixas do topo da área logada. Sem nome no token não há iniciais, e um
 * círculo vazio diria menos que nada.
 */
export function HeaderActions() {
  const userName = loggedUserName() ?? '';
  const initials = useMemo(() => getInitials(userName), [userName]);

  return (
    <>
      <ThemeToggleButton />
      {initials ? <InitialsAvatar initials={initials} label={userName} /> : null}
    </>
  );
}
