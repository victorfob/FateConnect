import { useMemo, useSyncExternalStore } from 'react';

import { tokenStorage } from '@app/services/auth/tokenStorage';

/** A chave leva o token: quem entra depois na mesma aba não herda o dado de quem saiu. */
export function useSessionQueryKey(name: string) {
  const token = useSyncExternalStore(tokenStorage.subscribe, tokenStorage.getToken);
  const queryKey = useMemo(() => [name, token], [name, token]);

  return { queryKey, signedIn: token !== null };
}
