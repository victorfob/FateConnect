import { use, useSyncExternalStore } from 'react';

import { SessionRefusedContext } from '@app/providers/SessionProvider/context';
import { SessionStatusEnum } from '@app/providers/SessionProvider/types';
import { tokenStorage } from '@app/services/auth/tokenStorage';

/**
 * Token guardado vence a recusa anterior — entrar de novo abre sessão nova sem
 * ninguém precisar limpar estado.
 */
export function useSessionStatus(): SessionStatusEnum {
  const refused = use(SessionRefusedContext);
  const token = useSyncExternalStore(tokenStorage.subscribe, tokenStorage.getToken);

  if (token) return SessionStatusEnum.VALID;
  if (refused) return SessionStatusEnum.EXPIRED;

  return SessionStatusEnum.NONE;
}
