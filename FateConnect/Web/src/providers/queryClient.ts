import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError, SessionExpiredError } from '@app/services/httpClient';

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
  if (error instanceof ApiError) return error.message;

  return FALLBACK_MESSAGE;
}

function notifierFor(notifyError: (message: string) => void) {
  return (error: unknown, meta: RequestErrorMeta | undefined): void => {
    // A tela de sessão expirada substitui o conteúdo inteiro; notificar por
    // cima dela é o mesmo recado duas vezes, e a mensagem da query ainda fala
    // de carregar dados, que deixou de ser o assunto.
    if (error instanceof SessionExpiredError) return;

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
