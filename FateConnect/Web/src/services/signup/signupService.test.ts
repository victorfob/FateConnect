import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';
import { signup } from './signupService';
import type { SignupRequest } from './types';

const SIGNUP_URL = 'https://api.fateconnect.test/usuario/cadastro';

const PAYLOAD: SignupRequest = {
  emailFatec: 'aluno.teste@aluno.cps.sp.gov.br',
  senha: 'segredo123',
  nomeCompleto: 'Fulano de Tal',
  dataNascimento: '2000-01-01T00:00:00Z',
  genero: 'Feminino',
  enderecos: [],
  contatos: [],
};

describe('signupService', () => {
  it('should post the payload and return the created user', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(SIGNUP_URL, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({
          id: 1,
          emailFatec: PAYLOAD.emailFatec,
          nomeCompleto: PAYLOAD.nomeCompleto,
        });
      }),
    );

    const created = await signup(PAYLOAD);

    expect(receivedBody).toEqual(PAYLOAD);
    expect(created.id).toBe(1);
  });
});
