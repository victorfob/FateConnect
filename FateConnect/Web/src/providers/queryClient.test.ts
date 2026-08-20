import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { createQueryClient, type RequestErrorMeta } from './queryClient';

function clientWithNotifier() {
  const notifyError = vi.fn();

  return { client: createQueryClient(notifyError), notifyError };
}

async function failQuery(client: QueryClient, error: unknown, meta?: RequestErrorMeta) {
  await client
    .fetchQuery({
      queryKey: [crypto.randomUUID()],
      queryFn: () => Promise.reject(error),
      retry: false,
      meta,
    })
    .catch(() => undefined);
}

// O contrato é: erro de requisição vira **uma** notificação, e a tela escolhe
// entre a mensagem dela, o silêncio (quando avisa sozinha) ou a genérica.
describe('createQueryClient', () => {
  it('should notify the message the screen declared in the request meta', async () => {
    const { client, notifyError } = clientWithNotifier();

    await failQuery(client, { message: 'da api' }, { errorMessage: 'da tela' });

    expect(notifyError).toHaveBeenCalledWith('da tela');
  });

  it('should notify the api message when the screen declared none', async () => {
    const { client, notifyError } = clientWithNotifier();

    await failQuery(client, { message: 'da api' });

    expect(notifyError).toHaveBeenCalledWith('da api');
  });

  it('should fall back to a generic message when the error carries none', async () => {
    const { client, notifyError } = clientWithNotifier();

    await failQuery(client, {});

    expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Algo deu errado'));
  });

  it('should stay quiet when the screen notifies the error itself', async () => {
    const { client, notifyError } = clientWithNotifier();

    await failQuery(client, { message: 'da api' }, { notifiesErrorItself: true });

    expect(notifyError).not.toHaveBeenCalled();
  });
});
