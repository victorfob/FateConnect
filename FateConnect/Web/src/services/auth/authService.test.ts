import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { login, logout } from './authService';
import { tokenStorage } from './tokenStorage';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';
const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';

const NO_CONTENT = 204;
const SERVER_ERROR = 500;

describe('authService', () => {
  it('should store the session after a successful login', async () => {
    server.use(http.post(LOGIN_URL, () => HttpResponse.json({ token: 'abc' })));

    const response = await login({ fatecEmail: 'a@fatec.sp.gov.br', password: 'segredo123' });

    expect(response).toEqual({ token: 'abc' });
    expect(tokenStorage.getToken()).toBe('abc');
  });

  it('should clear the session on logout', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    tokenStorage.save('abc');

    await logout();

    expect(tokenStorage.getToken()).toBeNull();
  });

  it('should clear the session even when the server refuses the logout', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    tokenStorage.save('abc');

    await logout();

    expect(tokenStorage.getToken()).toBeNull();
  });
});
