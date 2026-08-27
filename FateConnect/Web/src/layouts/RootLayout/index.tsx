import { Outlet, ScrollRestoration } from 'react-router';

import { SessionExpiryGate } from '@app/components/SessionExpiryGate';
import { useHashScroll } from '@app/hooks/useHashScroll';

/**
 * Raiz de todas as rotas: restaura a posição de scroll entre navegações e
 * resolve o fragmento da URL quando a página entra já com `#secao`.
 */
export function RootLayout() {
  useHashScroll();

  return (
    <>
      <ScrollRestoration />
      <SessionExpiryGate>
        <Outlet />
      </SessionExpiryGate>
    </>
  );
}
