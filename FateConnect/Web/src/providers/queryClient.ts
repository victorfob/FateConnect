import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import type { ApiError } from '@app/services/httpClient';

const RETRY_ATTEMPTS = 1;

const FALLBACK_MESSAGE = 'Algo deu errado. Tente novamente.';

/**
 * Como cada requisição quer ser avisada em caso de erro.
 *
 * - `errorMessage`: a mensagem da tela, no lugar da genérica.
 * - `notifiesErrorItself`: a tela decide a mensagem pelo status e avisa sozinha;
 *   aqui ficamos calados para não sair notificação em dobro.
 */
export type RequestErrorMeta = { errorMessage?: string; notifiesErrorItself?: boolean };

function messageOf(error: unknown): string {
  const apiError = error as ApiError;

  return apiError?.message ?? FALLBACK_MESSAGE;
}

function notifierFor(notifyError: (message: string) => void) {
  return (error: unknown, meta: RequestErrorMeta | undefined): void => {
    if (meta?.notifiesErrorItself) return;

    notifyError(meta?.errorMessage ?? messageOf(error));
  };
}

/**
 * Erro de requisição vira notificação em um lugar só. A tela continua
 * respondendo — o usuário é avisado, não travado.
 */
export function createQueryClient(notifyError: (message: string) => void): QueryClient {
  const notify = notifierFor(notifyError);

  return new QueryClient({
    defaultOptions: {
      queries: { retry: RETRY_ATTEMPTS, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
    queryCache: new QueryCache({ onError: (error, query) => notify(error, query.meta) }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => notify(error, mutation.meta),
    }),
  });
}
