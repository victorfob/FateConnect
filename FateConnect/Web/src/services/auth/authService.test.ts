import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { apiClient } from '@app/services/httpClient';

import { login, logout } from './authService';
import { tokenStorage } from './tokenStorage';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';
const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';

const NO_CONTENT = 204;
const SERVER_ERROR = 500;

describe('authService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should store the session after a successful login', async () => {
    server.use(http.post(LOGIN_URL, () => HttpResponse.json({ token: 'abc' })));

    const response = await login({ fatecEmail: 'a@fatec.sp.gov.br', password: 'segredo123' });

    expect(response).toEqual({ token: 'abc' });
    expect(tokenStorage.getToken()).toBe('abc');
  });

  it('should clear the session on logout without waiting for the server', () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    tokenStorage.save('abc');

    logout();

    expect(tokenStorage.getToken()).toBeNull();
  });

  // O interceptor lê o token do armazenamento, que já saiu: sem o cabeçalho
  // explícito a requisição parte sem credencial e o servidor não invalida nada.
  it('should still carry the token that was cleared', async () => {
    let authorization: string | null = null;
    server.use(
      http.post(LOGOUT_URL, ({ request }) => {
        authorization = request.headers.get('authorization');

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    tokenStorage.save('abc');

    logout();

    await vi.waitFor(() => expect(authorization).toBe('Bearer abc'));
  });

  // As duas metades no mesmo caso: a segunda prova que a espiã consegue
  // registrar chamada, então o `not.toHaveBeenCalled` da primeira significa algo.
  it('should reach the server only when there is a session to end', () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    const post = vi.spyOn(apiClient, 'post');

    logout();

    expect(post).not.toHaveBeenCalled();

    tokenStorage.save('abc');
    logout();

    expect(post).toHaveBeenCalled();
  });

  it('should clear the session even when the server refuses the logout', async () => {
    let chamado = false;
    server.use(
      http.post(LOGOUT_URL, () => {
        chamado = true;

        return new HttpResponse(null, { status: SERVER_ERROR });
      }),
    );
    tokenStorage.save('abc');

    logout();

    expect(tokenStorage.getToken()).toBeNull();
    await vi.waitFor(() => expect(chamado).toBe(true));
  });
});
