import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const NO_CONTENT = 204;

const defaultHandlers = [
  http.get(
    'https://api.fateconnect.test/auth/session',
    () => new HttpResponse(null, { status: NO_CONTENT }),
  ),
];

/** Servidor de mocks compartilhado. Cada teste registra os handlers de que precisa. */
export const server = setupServer(...defaultHandlers);
