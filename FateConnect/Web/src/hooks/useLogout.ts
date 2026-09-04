import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { logout } from '@app/services/auth/authService';

/**
 * Encerra a sessão. Não navega: apagar o token muda o status que o guard de
 * rota lê, e é ele quem manda para a landing.
 */
export function useLogout(): VoidFunction {
  const { mutate: signOut } = useMutation({ mutationFn: logout });

  return useCallback(() => signOut(), [signOut]);
}
