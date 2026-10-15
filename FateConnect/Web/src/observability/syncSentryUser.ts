import { setUser } from '@sentry/react';

import { loggedUserEmail } from '@app/services/auth/loggedUser';
import { tokenStorage } from '@app/services/auth/tokenStorage';

function identifyLoggedUser(): void {
  const email = loggedUserEmail();
  if (!email) {
    setUser(null);
    return;
  }

  setUser({ email });
}

export function syncSentryUser(): void {
  identifyLoggedUser();
  tokenStorage.subscribe(identifyLoggedUser);
}
