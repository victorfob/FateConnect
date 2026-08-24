import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';

import { login, logout } from './authService';
import { tokenStorage } from './tokenStorage';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';

describe('authService', () => {
  it('should store the session after a successful login', async () => {
    server.use(
      http.post(LOGIN_URL, () => HttpResponse.json({ token: 'abc', nomeCompleto: 'Fulano' })),
    );

    const response = await login({ emailFatec: 'a@fatec.sp.gov.br', senha: 'segredo123' });

    expect(response.nomeCompleto).toBe('Fulano');
    expect(tokenStorage.getToken()).toBe('abc');
  });

  it('should clear the session on logout', () => {
    tokenStorage.save('abc', 'Fulano');

    logout();

    expect(tokenStorage.getToken()).toBeNull();
  });
});
