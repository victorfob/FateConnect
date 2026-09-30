import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { loggedUserName } from '@app/services/auth/loggedUser';
import { PROFILE } from '@app/test/profile';

const NO_CONTENT = 204;

const defaultHandlers = [
  http.get(
    'https://api.fateconnect.test/auth/session',
    () => new HttpResponse(null, { status: NO_CONTENT }),
  ),
  // O menu da conta pede o perfil em toda tela logada; o nome é o do token do teste.
  http.get('https://api.fateconnect.test/users/me', () =>
    HttpResponse.json({ ...PROFILE, fullName: loggedUserName() ?? PROFILE.fullName }),
  ),
];

/** Servidor de mocks compartilhado. Cada teste registra os handlers de que precisa. */
export const server = setupServer(...defaultHandlers);
