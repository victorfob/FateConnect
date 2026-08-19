import { SnackbarProvider } from 'notistack';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@ds';
import { NOTIFICATION_AUTO_HIDE_MS } from '@app/hooks/useNotification';
import { QueryProvider } from './QueryProvider';

const MAX_STACKED_NOTIFICATIONS = 3;

/** Composição única dos providers da aplicação, reusada também nos testes. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={MAX_STACKED_NOTIFICATIONS}
        autoHideDuration={NOTIFICATION_AUTO_HIDE_MS}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <QueryProvider>{children}</QueryProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
