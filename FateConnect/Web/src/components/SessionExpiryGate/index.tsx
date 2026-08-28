import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { SessionExpiredScreen } from '@app/components/SessionExpiredScreen';
import { subscribeToSessionExpiry } from '@app/services/auth/sessionExpiry';

type SessionExpiryGateProps = Readonly<{ children: ReactNode }>;

/**
 * Vive dentro do roteador porque a saída da tela é uma navegação — e é a
 * própria navegação que reabre o conteúdo, sem ninguém desligar o aviso à mão.
 */
export function SessionExpiryGate({ children }: SessionExpiryGateProps) {
  // Guardar ONDE expirou, e não um booleano, é o que dispensa o efeito de
  // reset: sair daquele caminho já não casa mais, e o conteúdo volta sozinho.
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => subscribeToSessionExpiry(() => setExpiredAt(pathname)), [pathname]);

  if (expiredAt === pathname) return <SessionExpiredScreen />;

  return children;
}
