import type { ReactNode } from 'react';
import { DateLocalizationProvider, NotificationProvider, ThemeProvider } from '@design-system';

import { QueryProvider } from './QueryProvider';

/** Composição única dos providers da aplicação, reusada também nos testes. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <QueryProvider>
          <DateLocalizationProvider>{children}</DateLocalizationProvider>
        </QueryProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
