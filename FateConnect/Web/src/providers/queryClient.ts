import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import type { ApiError } from '@app/services/httpClient';

const RETRY_ATTEMPTS = 1;

function messageOf(error: unknown): string {
  const apiError = error as ApiError;

  return apiError?.message ?? 'Algo deu errado. Tente novamente.';
}

/**
 * Erro de requisição vira notificação em um lugar só. A tela continua
 * respondendo — o usuário é avisado, não travado.
 */
export function createQueryClient(notifyError: (message: string) => void): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: RETRY_ATTEMPTS, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
    queryCache: new QueryCache({ onError: (error) => notifyError(messageOf(error)) }),
    mutationCache: new MutationCache({ onError: (error) => notifyError(messageOf(error)) }),
  });
}
