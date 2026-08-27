import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { tokenStorage } from './auth/tokenStorage';
import { apiClient, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from './httpClient';

const PING_URL = 'https://api.fateconnect.test/ping';

describe('httpClient', () => {
  it('should send the stored token in the authorization header', async () => {
    let receivedHeader: string | null = null;
    server.use(
      http.get(PING_URL, ({ request }) => {
        receivedHeader = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );
    tokenStorage.save('token-123', 'Fulano');

    await apiClient.get('/ping');

    expect(receivedHeader).toBe('Bearer token-123');
  });

  it('should not send an authorization header when there is no token', async () => {
    let receivedHeader: string | null = 'nao-lido';
    server.use(
      http.get(PING_URL, ({ request }) => {
        receivedHeader = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiClient.get('/ping');

    expect(receivedHeader).toBeNull();
  });

  it('should normalize an http failure into an api error carrying the status', async () => {
    server.use(http.get(PING_URL, () => new HttpResponse(null, { status: 500 })));

    await expect(apiClient.get('/ping')).rejects.toThrow(
      expect.objectContaining({ status: 500, message: GENERIC_ERROR_MESSAGE }),
    );
  });

  it('should normalize a network failure into an api error without status', async () => {
    server.use(http.get(PING_URL, () => HttpResponse.error()));

    await expect(apiClient.get('/ping')).rejects.toThrow(
      expect.objectContaining({ status: undefined, message: NETWORK_ERROR_MESSAGE }),
    );
  });
});
