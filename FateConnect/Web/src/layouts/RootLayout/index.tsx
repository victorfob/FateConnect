import { Outlet, ScrollRestoration } from 'react-router';

import { PageMetadata } from '@app/components/PageMetadata';
import { useHashScroll } from '@app/hooks/useHashScroll';
import { usePushNotificationClicks } from '@app/hooks/usePushNotificationClicks';
import { SessionProvider } from '@app/providers/SessionProvider';

/**
 * Raiz de todas as rotas: restaura a posição de scroll entre navegações e
 * resolve o fragmento da URL quando a página entra já com `#secao`.
 */
export function RootLayout() {
  useHashScroll();
  usePushNotificationClicks();

  return (
    <>
      <PageMetadata />
      <ScrollRestoration />
      <SessionProvider>
        <Outlet />
      </SessionProvider>
    </>
  );
}
