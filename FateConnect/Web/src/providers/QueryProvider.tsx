import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { useNotification } from '@app/hooks/useNotification';
import { createQueryClient } from './queryClient';

/** Precisa ficar dentro do provider de notificação: consome o notificador. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const { notifyError } = useNotification();
  const [queryClient] = useState(() => createQueryClient(notifyError));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
