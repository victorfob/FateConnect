import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { apiClient } from '@app/services/httpClient';

import {
  confirmEmail,
  forgotPassword,
  login,
  logout,
  reactivate,
  resendConfirmationEmail,
  resetPassword,
  verifyResetToken,
} from './authService';
import { tokenStorage } from './tokenStorage';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';
const REACTIVATE_URL = 'https://api.fateconnect.test/auth/reactivate';
const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';
const CONFIRM_EMAIL_URL = 'https://api.fateconnect.test/auth/confirm-email';
const RESEND_CONFIRMATION_URL = 'https://api.fateconnect.test/auth/resend-confirmation-email';
const FORGOT_PASSWORD_URL = 'https://api.fateconnect.test/auth/forgot-password';
const VERIFY_RESET_TOKEN_URL = 'https://api.fateconnect.test/auth/verify-reset-token';
const RESET_PASSWORD_URL = 'https://api.fateconnect.test/auth/reset-password';

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

  it('should send the credentials to the reactivation route and store the session', async () => {
    let body: unknown = null;
    server.use(
      http.post(REACTIVATE_URL, async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({ token: 'def' });
      }),
    );

    const response = await reactivate({ fatecEmail: 'a@fatec.sp.gov.br', password: 'segredo123' });

    expect(body).toEqual({ fatecEmail: 'a@fatec.sp.gov.br', password: 'segredo123' });
    expect(response).toEqual({ token: 'def' });
    expect(tokenStorage.getToken()).toBe('def');
  });

  it('should confirm the email with the link token and open the session it answers', async () => {
    let body: unknown = null;
    server.use(
      http.post(CONFIRM_EMAIL_URL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ token: 'ghi' });
      }),
    );

    const response = await confirmEmail('token-do-link');

    expect(body).toEqual({ token: 'token-do-link' });
    expect(response).toEqual({ token: 'ghi' });
    expect(tokenStorage.getToken()).toBe('ghi');
  });

  it('should ask for a new confirmation link for the given email', async () => {
    let body: unknown = null;
    server.use(
      http.post(RESEND_CONFIRMATION_URL, async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await resendConfirmationEmail('a@fatec.sp.gov.br');

    expect(body).toEqual({ fatecEmail: 'a@fatec.sp.gov.br' });
  });

  it('should ask for the password reset link for the given email', async () => {
    let body: unknown = null;
    server.use(
      http.post(FORGOT_PASSWORD_URL, async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await forgotPassword('a@fatec.sp.gov.br');

    expect(body).toEqual({ fatecEmail: 'a@fatec.sp.gov.br' });
  });

  it('should check the reset link token in the body, out of the url that logs keep', async () => {
    let body: unknown = null;
    let query = '';
    server.use(
      http.post(VERIFY_RESET_TOKEN_URL, async ({ request }) => {
        body = await request.json();
        query = new URL(request.url).search;
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await verifyResetToken('token-do-link');

    expect(body).toEqual({ token: 'token-do-link' });
    expect(query).toBe('');
  });

  it('should reset the password and open the session it answers', async () => {
    let body: unknown = null;
    server.use(
      http.post(RESET_PASSWORD_URL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ token: 'jkl' });
      }),
    );

    const response = await resetPassword({ token: 'token-do-link', newPassword: 'nova-senha-1' });

    expect(body).toEqual({ token: 'token-do-link', newPassword: 'nova-senha-1' });
    expect(response).toEqual({ token: 'jkl' });
    expect(tokenStorage.getToken()).toBe('jkl');
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
