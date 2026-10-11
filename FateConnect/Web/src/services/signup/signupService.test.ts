import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { tokenStorage } from '../auth/tokenStorage';
import { signup } from './signupService';
import { DocumentTypeEnum, type SignupRequest } from './types';

const SIGNUP_URL = 'https://api.fateconnect.test/users/signup';
const CREATED = 201;

const PAYLOAD: SignupRequest = {
  fatecEmail: 'aluno.teste@aluno.cps.sp.gov.br',
  password: 'segredo123',
  fullName: 'Fulano de Tal',
  birthDate: '2000-01-01T00:00:00Z',
  gender: 'Female',
  acceptances: [{ document: DocumentTypeEnum.TERMS_OF_USE, version: '2026-01-15' }],
  receiveEmails: false,
  receiveNotifications: false,
};

describe('signupService', () => {
  // A conta só abre sessão depois de confirmar o e-mail: o cadastro não guarda nada.
  it('should post the payload and leave the session closed', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(SIGNUP_URL, async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: CREATED });
      }),
    );

    await signup(PAYLOAD);

    expect(receivedBody).toEqual(PAYLOAD);
    expect(tokenStorage.getToken()).toBeNull();
  });
});
