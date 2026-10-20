import { useEffect, useState, type ReactNode } from 'react';

import { isSessionStillValid } from '@app/services/auth/authService';
import { tokenStorage } from '@app/services/auth/tokenStorage';

import { SessionRefusedContext } from './context';

type SessionProviderProps = Readonly<{ children: ReactNode }>;

export function SessionProvider({ children }: SessionProviderProps) {
  const [checked, setChecked] = useState(() => !tokenStorage.getToken());
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    if (checked) return;

    void isSessionStillValid().then((valid) => {
      setRefused(!valid);
      setChecked(true);
    });
  }, [checked]);

  // A recusa é do token do carregamento: sem esquecê-la, o Sair depois de entrar de novo abriria a tela de expirada.
  useEffect(
    () =>
      tokenStorage.subscribe(() => {
        if (tokenStorage.getToken()) setRefused(false);
      }),
    [],
  );

  if (!checked) return null;

  return <SessionRefusedContext value={refused}>{children}</SessionRefusedContext>;
}
