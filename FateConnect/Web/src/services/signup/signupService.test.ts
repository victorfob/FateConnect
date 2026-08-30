import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { tokenStorage } from '../auth/tokenStorage';
import { signup } from './signupService';
import type { SignupRequest } from './types';

const SIGNUP_URL = 'https://api.fateconnect.test/users/signup';

const PAYLOAD: SignupRequest = {
  fatecEmail: 'aluno.teste@aluno.cps.sp.gov.br',
  password: 'segredo123',
  fullName: 'Fulano de Tal',
  birthDate: '2000-01-01T00:00:00Z',
  gender: 'Female',
  addresses: [],
  contacts: [],
};

describe('signupService', () => {
  it('should post the payload and open the session with the token it answers', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(SIGNUP_URL, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ token: 'abc' });
      }),
    );

    const created = await signup(PAYLOAD);

    expect(receivedBody).toEqual(PAYLOAD);
    expect(created).toEqual({ token: 'abc' });
    expect(tokenStorage.getToken()).toBe('abc');
  });
});
