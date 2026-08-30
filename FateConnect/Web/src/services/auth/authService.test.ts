import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { login, logout } from './authService';
import { tokenStorage } from './tokenStorage';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';

describe('authService', () => {
  it('should store the session after a successful login', async () => {
    server.use(http.post(LOGIN_URL, () => HttpResponse.json({ token: 'abc', fullName: 'Fulano' })));

    const response = await login({ fatecEmail: 'a@fatec.sp.gov.br', password: 'segredo123' });

    expect(response.fullName).toBe('Fulano');
    expect(tokenStorage.getToken()).toBe('abc');
  });

  it('should clear the session on logout', () => {
    tokenStorage.save('abc');

    logout();

    expect(tokenStorage.getToken()).toBeNull();
  });
});
