import { useMemo } from 'react';
import { InitialsAvatar, ThemeToggleButton } from '@design-system';

import { tokenStorage } from '@app/services/auth/tokenStorage';
import { getInitials } from '@app/utils/initials';

/**
 * Ações fixas do topo da área logada. O nome vem do login, guardado junto do
 * token: sem nome guardado não há iniciais, e um círculo vazio diria menos que
 * nada.
 */
export function HeaderActions() {
  const userName = tokenStorage.getUserName() ?? '';
  const initials = useMemo(() => getInitials(userName), [userName]);

  return (
    <>
      <ThemeToggleButton />
      {initials ? <InitialsAvatar initials={initials} label={userName} /> : null}
    </>
  );
}
